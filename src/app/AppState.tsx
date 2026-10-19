import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { routeChoiceCampaignByOperatorId } from '../config/unlockCampaigns'
import { builtInStations, routes } from '../data/stations'
import { normalizeReading, readingForMode, splitKana } from '../domain/kana'
import { isLearningModeUnlocked, KATAKANA_UNLOCK_MILESTONE_ID, katakanaUnlockCount, KATAKANA_UNLOCK_STATIONS, type PracticeLearningMode } from '../domain/learningModes'
import { appendMilestoneHistory, milestoneEventsForPracticeResult, recoverRouteAchievementHistory } from '../domain/milestoneHistory'
import { appendPracticeHistory, createPracticeHistoryEvent } from '../domain/practiceHistory'
import { completeFreeWrittenPosition, completePosition, freshProgress, isStationFreeWritten, isStationPracticed, newlyUnlockedRouteAchievements, reconcileProgress, type RouteAchievement } from '../domain/progress'
import type { AppSettings, AppState, CustomStation, PersistedState, PracticeMode, Station, StationOverride } from '../domain/types'
import { grantEarnedMilestones, grantRouteChoice, migrateUnlockMilestones, routeCheckpointMilestoneById, UNLOCK_SYSTEM_VERSION } from '../domain/unlocks'
import { defaultState, loadState, saveState } from '../services/storage/storage'

interface AppStateValue {
  state: AppState
  stations: Station[]
  stationById: Map<string, Station>
  storageWarning?: string
  learningMode: PracticeLearningMode
  progress: PersistedState['progressByMode']['hiragana']
  setLearningMode: (mode: PracticeLearningMode) => void
  routeStationIds: (routeId: string) => string[]
  updateSettings: (patch: Partial<AppSettings>) => void
  markPositionComplete: (stationId: string, position: number, mode: PracticeMode, freeWritten?: boolean) => { firstAdd: boolean; allComplete: boolean; allFreeWritten: boolean; routeAchievements: RouteAchievement[]; unlockedMilestones: string[] }
  unlockRoute: (routeId: string) => void
  setCurrentPosition: (stationId: string, position: number) => void
  saveStation: (station: CustomStation | Station, routeId?: string | null, insertAfterStationId?: string | null) => void
  deleteCustomStation: (stationId: string) => void
  resetBuiltInStation: (stationId: string) => void
  replaceState: (state: PersistedState) => void
  clearAll: () => void
}

const Context = createContext<AppStateValue | null>(null)

function routeStationIdsForState(routeId: string, state: AppState): string[] {
  const route = routes.find((item) => item.id === routeId)
  if (!route) return []
  const ordered = [...route.orderedStationIds]
  for (const station of state.customStations.filter((item) => item.routeId === routeId)) {
    if (station.insertAfterStationId === null) {
      ordered.unshift(station.id)
      continue
    }
    const index = ordered.indexOf(station.insertAfterStationId)
    ordered.splice(index >= 0 ? index + 1 : ordered.length, 0, station.id)
  }
  return ordered
}

function withEarnedMilestones(state: AppState): AppState {
  const stations = builtInStations.map((station) => ({ ...station, ...state.stationOverrides[station.id] }))
  const stationById = new Map(stations.map((station) => [station.id, station]))
  let unlockedMilestones = grantEarnedMilestones(
    migrateUnlockMilestones(state.unlockedMilestones, state.unlockSystemVersion),
    { routes, stationById, progress: state.progressByMode.hiragana },
  )
  if (katakanaUnlockCount(stations, state.progressByMode.hiragana) >= KATAKANA_UNLOCK_STATIONS) {
    unlockedMilestones = [...new Set([...unlockedMilestones, KATAKANA_UNLOCK_MILESTONE_ID])]
  }
  return unlockedMilestones.length === state.unlockedMilestones.length && state.unlockSystemVersion === UNLOCK_SYSTEM_VERSION
    ? state
    : { ...state, unlockSystemVersion: UNLOCK_SYSTEM_VERSION, unlockedMilestones }
}

function withRecoveredMilestoneHistory(state: AppState): AppState {
  const stations = [
    ...builtInStations.map((station) => ({ ...station, ...state.stationOverrides[station.id] })),
    ...state.customStations,
  ]
  const stationById = new Map(stations.map((station) => [station.id, station]))
  const milestoneHistory = recoverRouteAchievementHistory(
    state.milestoneHistory,
    routes.map((route) => ({ routeId: route.id, stationIds: routeStationIdsForState(route.id, state) })),
    stationById,
    state.progressByMode.hiragana,
  )
  return milestoneHistory.length === state.milestoneHistory.length ? state : { ...state, milestoneHistory }
}

function prepareLoadedState(state: AppState): AppState {
  const prepared = withRecoveredMilestoneHistory(withEarnedMilestones(state))
  const stations = builtInStations.map((station) => ({ ...station, ...prepared.stationOverrides[station.id] }))
  return isLearningModeUnlocked(prepared.settings.learningMode, stations, prepared.progressByMode.hiragana, prepared.unlockedMilestones)
    ? prepared
    : { ...prepared, settings: { ...prepared.settings, learningMode: 'hiragana' } }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const loaded = useMemo(() => {
    const result = loadState()
    return { ...result, state: prepareLoadedState(result.state) }
  }, [])
  const [state, setState] = useState<AppState>(loaded.state)
  const [storageWarning, setStorageWarning] = useState<string | undefined>(loaded.warning)

  const stations = useMemo<Station[]>(() => {
    const merged = builtInStations.map((station) => ({ ...station, ...state.stationOverrides[station.id] }))
    return [...merged, ...state.customStations]
  }, [state.customStations, state.stationOverrides])
  const stationById = useMemo(() => new Map(stations.map((station) => [station.id, station])), [stations])
  const learningMode = state.settings.learningMode
  const progress = state.progressByMode[learningMode]

  useEffect(() => {
    try {
      saveState(state)
      setStorageWarning(undefined)
    } catch {
      setStorageWarning('このブラウザに ほぞんできませんでした。バックアップを おすすめします。')
    }
  }, [state])

  const routeStationIds = useCallback((routeId: string) => {
    return routeStationIdsForState(routeId, state)
  }, [state.customStations])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...patch } }))
  }, [])

  const setLearningMode = useCallback((mode: PracticeLearningMode) => {
    setState((current) => isLearningModeUnlocked(mode, stations, current.progressByMode.hiragana, current.unlockedMilestones)
      ? { ...current, settings: { ...current.settings, learningMode: mode } }
      : current)
  }, [stations])

  const markPositionComplete = useCallback((stationId: string, position: number, mode: PracticeMode, freeWritten = false) => {
    const station = stationById.get(stationId)
    if (!station) return { firstAdd: false, allComplete: false, allFreeWritten: false, routeAchievements: [], unlockedMilestones: [] }
    const targetReading = readingForMode(station.reading, learningMode)
    const kana = splitKana(targetReading)[position]
    if (!kana) return { firstAdd: false, allComplete: false, allFreeWritten: false, routeAchievements: [], unlockedMilestones: [] }
    const practiceEvent = createPracticeHistoryEvent(station, kana, position, mode, freeWritten, learningMode)
    const previous = reconcileProgress(progress[stationId], targetReading)
    const update = freeWritten ? completeFreeWrittenPosition : completePosition
    const completed = update(previous, position)
    const progressAfter = { ...progress, [stationId]: completed }
    const routeAchievements = newlyUnlockedRouteAchievements(
      routes.map((route) => ({ routeId: route.id, stationIds: routeStationIds(route.id) })),
      stationById,
      progress,
      progressAfter,
      learningMode,
    )
    let unlockedAfter = learningMode === 'hiragana'
      ? grantEarnedMilestones(state.unlockedMilestones, { routes, stationById, progress: progressAfter })
      : state.unlockedMilestones
    if (learningMode === 'hiragana' && katakanaUnlockCount([...stationById.values()], progressAfter) >= KATAKANA_UNLOCK_STATIONS) {
      unlockedAfter = [...new Set([...unlockedAfter, KATAKANA_UNLOCK_MILESTONE_ID])]
    }
    const unlockedMilestones = unlockedAfter.filter((id) => !state.unlockedMilestones.includes(id))
    const milestoneEvents = milestoneEventsForPracticeResult(
      routeAchievements,
      unlockedMilestones,
      routeCheckpointMilestoneById,
      new Date().toISOString(),
      learningMode,
    )
    const result = {
      firstAdd: !previous.added,
      allComplete: isStationPracticed(completed, targetReading),
      allFreeWritten: isStationFreeWritten(completed, targetReading),
      routeAchievements,
      unlockedMilestones,
    }
    setState((current) => {
      const activeProgress = current.progressByMode[learningMode]
      const existing = reconcileProgress(activeProgress[stationId], targetReading)
      const updated = {
        ...current,
        progressByMode: { ...current.progressByMode, [learningMode]: { ...activeProgress, [stationId]: update(existing, position) } },
      }
      const earned = learningMode === 'hiragana' ? withEarnedMilestones(updated) : updated
      return {
        ...earned,
        practiceHistory: appendPracticeHistory(earned.practiceHistory, practiceEvent),
        milestoneHistory: milestoneEvents.length === 0
          ? earned.milestoneHistory
          : appendMilestoneHistory(earned.milestoneHistory, milestoneEvents),
      }
    })
    return result
  }, [learningMode, progress, routeStationIds, state.unlockedMilestones, stationById])

  const setCurrentPosition = useCallback((stationId: string, position: number) => {
    const station = stationById.get(stationId)
    if (!station) return
    setState((current) => {
      const targetReading = readingForMode(station.reading, current.settings.learningMode)
      const modeProgress = current.progressByMode[current.settings.learningMode]
      const item = reconcileProgress(modeProgress[stationId], targetReading)
      return { ...current, progressByMode: { ...current.progressByMode, [current.settings.learningMode]: { ...modeProgress, [stationId]: { ...item, currentPosition: position } } } }
    })
  }, [stationById])

  const unlockRoute = useCallback((routeId: string) => {
    setState((current) => {
      const earned = withEarnedMilestones(current)
      const route = routes.find((candidate) => candidate.id === routeId)
      const campaign = route ? routeChoiceCampaignByOperatorId.get(route.operatorId) : undefined
      if (!campaign) return earned
      const unlockedMilestones = grantRouteChoice(earned.unlockedMilestones, campaign, routeId)
      return unlockedMilestones.length === earned.unlockedMilestones.length
        ? earned
        : { ...earned, unlockedMilestones }
    })
  }, [])

  const saveStation = useCallback((station: CustomStation | Station, routeId?: string | null, insertAfterStationId?: string | null) => {
    setState((current) => {
      if (station.builtIn) {
        const override: StationOverride = {
          displayName: station.displayName.trim(),
          reading: normalizeReading(station.reading),
          speechText: station.speechText?.trim() || undefined,
        }
        const previousReading = current.stationOverrides[station.id]?.reading
          ?? builtInStations.find((item) => item.id === station.id)?.reading
        const progressByMode = { hiragana: { ...current.progressByMode.hiragana }, katakana: { ...current.progressByMode.katakana } }
        if (previousReading !== override.reading) for (const mode of ['hiragana', 'katakana'] as const) delete progressByMode[mode][station.id]
        return { ...current, stationOverrides: { ...current.stationOverrides, [station.id]: override }, progressByMode }
      }
      const existing = station as CustomStation
      const custom: CustomStation = {
        ...existing,
        builtIn: false,
        displayName: station.displayName.trim(),
        reading: normalizeReading(station.reading),
        speechText: station.speechText?.trim() || undefined,
        routeId: routeId !== undefined ? routeId : existing.routeId,
        insertAfterStationId: insertAfterStationId !== undefined ? insertAfterStationId : existing.insertAfterStationId,
      }
      const customStations = current.customStations.some((item) => item.id === custom.id)
        ? current.customStations.map((item) => item.id === custom.id ? custom : item)
        : [...current.customStations, custom]
      const previousReading = current.customStations.find((item) => item.id === custom.id)?.reading
      const progressByMode = { hiragana: { ...current.progressByMode.hiragana }, katakana: { ...current.progressByMode.katakana } }
      if (previousReading && previousReading !== custom.reading) for (const mode of ['hiragana', 'katakana'] as const) delete progressByMode[mode][custom.id]
      return { ...current, customStations, progressByMode }
    })
  }, [])

  const deleteCustomStation = useCallback((stationId: string) => {
    setState((current) => {
      const progressByMode = { hiragana: { ...current.progressByMode.hiragana }, katakana: { ...current.progressByMode.katakana } }
      for (const mode of ['hiragana', 'katakana'] as const) delete progressByMode[mode][stationId]
      return { ...current, customStations: current.customStations.filter((item) => item.id !== stationId), progressByMode }
    })
  }, [])

  const resetBuiltInStation = useCallback((stationId: string) => {
    setState((current) => {
      const stationOverrides = { ...current.stationOverrides }
      delete stationOverrides[stationId]
      const progressByMode = { hiragana: { ...current.progressByMode.hiragana }, katakana: { ...current.progressByMode.katakana } }
      for (const mode of ['hiragana', 'katakana'] as const) delete progressByMode[mode][stationId]
      return { ...current, stationOverrides, progressByMode }
    })
  }, [])

  const value: AppStateValue = {
    state,
    stations,
    stationById,
    storageWarning,
    learningMode,
    progress,
    setLearningMode,
    routeStationIds,
    updateSettings,
    markPositionComplete,
    unlockRoute,
    setCurrentPosition,
    saveStation,
    deleteCustomStation,
    resetBuiltInStation,
    replaceState: (replacement) => setState(prepareLoadedState(replacement)),
    clearAll: () => setState(defaultState()),
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useAppState(): AppStateValue {
  const value = useContext(Context)
  if (!value) throw new Error('useAppState must be used inside AppStateProvider')
  return value
}
