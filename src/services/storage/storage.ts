import { builtInStationById, routes } from '../../data/stations'
import { isHiraganaReading, normalizeReading, splitKana } from '../../domain/kana'
import type {
  AppSettings,
  CustomStation,
  MilestoneHistoryEvent,
  PersistedState,
  PracticeHistoryEvent,
  PracticeProgress,
  StationOverride,
} from '../../domain/types'
import { UNLOCK_SYSTEM_VERSION } from '../../domain/unlocks'

export const STORAGE_KEY = 'jibun-no-rosenzu:v1'
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024

export const defaultSettings: AppSettings = {
  handedness: 'left',
  traceStrictness: 'standard',
  speechRate: 0.82,
  volume: 1,
  muted: false,
  reduceMotion: false,
}

export function defaultState(): PersistedState {
  return {
    schemaVersion: 1,
    unlockSystemVersion: UNLOCK_SYSTEM_VERSION,
    settings: { ...defaultSettings },
    customStations: [],
    stationOverrides: {},
    progress: {},
    practiceHistory: [],
    unlockedMilestones: [],
    milestoneHistory: [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asShortString(value: unknown, maxLength: number): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength ? value : null
}

function validateSettings(value: unknown): AppSettings | null {
  if (!isRecord(value)) return null
  if (value.handedness !== 'left' && value.handedness !== 'right') return null
  if (typeof value.speechRate !== 'number' || value.speechRate < 0.5 || value.speechRate > 1.2) return null
  if (typeof value.volume !== 'number' || value.volume < 0 || value.volume > 1) return null
  if (typeof value.muted !== 'boolean' || typeof value.reduceMotion !== 'boolean') return null
  const traceStrictness = value.traceStrictness === undefined
    ? 'standard'
    : value.traceStrictness === 'gentle' || value.traceStrictness === 'standard' || value.traceStrictness === 'careful'
      ? value.traceStrictness
      : null
  if (!traceStrictness) return null
  return {
    handedness: value.handedness,
    traceStrictness,
    speechRate: value.speechRate,
    volume: value.volume,
    muted: value.muted,
    reduceMotion: value.reduceMotion,
  }
}

function validateCustomStation(value: unknown, knownIds: Set<string>): CustomStation | null {
  if (!isRecord(value)) return null
  const id = asShortString(value.id, 100)
  const displayName = asShortString(value.displayName, 40)
  const readingRaw = asShortString(value.reading, 40)
  if (!id || !id.startsWith('custom-') || knownIds.has(id) || !displayName || !readingRaw) return null
  const reading = normalizeReading(readingRaw)
  if (!isHiraganaReading(reading)) return null
  const speechTextCandidate = value.speechText === undefined ? undefined : asShortString(value.speechText, 80)
  if (value.speechText !== undefined && !speechTextCandidate) return null
  const speechText = speechTextCandidate ?? undefined
  const routeId = value.routeId === null ? null : asShortString(value.routeId, 40)
  if (routeId !== null && !routes.some((route) => route.id === routeId)) return null
  const insertAfterStationId = value.insertAfterStationId === null ? null : asShortString(value.insertAfterStationId, 100)
  return {
    id,
    displayName,
    reading,
    speechText,
    builtIn: false,
    routeId,
    insertAfterStationId,
  }
}

function validateOverride(value: unknown): StationOverride | null {
  if (!isRecord(value)) return null
  const displayName = asShortString(value.displayName, 40)
  const readingRaw = asShortString(value.reading, 40)
  if (!displayName || !readingRaw || !isHiraganaReading(readingRaw)) return null
  const speechTextCandidate = value.speechText === undefined ? undefined : asShortString(value.speechText, 80)
  if (value.speechText !== undefined && !speechTextCandidate) return null
  const speechText = speechTextCandidate ?? undefined
  return { displayName, reading: normalizeReading(readingRaw), speechText }
}

function validateProgress(value: unknown, reading: string): PracticeProgress | null {
  if (!isRecord(value)) return null
  if (value.readingSnapshot !== normalizeReading(reading)) return null
  const length = splitKana(reading).length
  if (!Array.isArray(value.practicedPositions)) return null
  if (!value.practicedPositions.every((item) => Number.isInteger(item) && item >= 0 && item < length)) return null
  const practicedPositions = value.practicedPositions as number[]
  const freeWrittenPositions = value.freeWrittenPositions === undefined ? [] : value.freeWrittenPositions
  if (!Array.isArray(freeWrittenPositions)) return null
  if (!freeWrittenPositions.every((item) => Number.isInteger(item) && item >= 0 && item < length)) return null
  if (!freeWrittenPositions.every((item) => practicedPositions.includes(item))) return null
  if (!Number.isInteger(value.currentPosition) || (value.currentPosition as number) < 0 || (value.currentPosition as number) >= length) return null
  if (typeof value.added !== 'boolean') return null
  if (value.addedAt !== undefined && typeof value.addedAt !== 'string') return null
  return {
    readingSnapshot: value.readingSnapshot,
    practicedPositions: [...new Set(practicedPositions)].sort((a, b) => a - b),
    freeWrittenPositions: [...new Set(freeWrittenPositions as number[])].sort((a, b) => a - b),
    currentPosition: value.currentPosition as number,
    added: value.added,
    addedAt: value.addedAt as string | undefined,
  }
}

function validateMilestoneHistoryEvent(value: unknown): MilestoneHistoryEvent | null {
  if (!isRecord(value)) return null
  const id = asShortString(value.id, 180)
  const routeId = asShortString(value.routeId, 120)
  const achievedAt = asShortString(value.achievedAt, 40)
  const kind = value.kind === 'route-stamp' || value.kind === 'route-complete' || value.kind === 'route-master'
    ? value.kind
    : null
  if (!id || !routeId || !achievedAt || !kind || !Number.isFinite(Date.parse(achievedAt))) return null
  const ratio = value.ratio
  if (kind === 'route-stamp' && ratio !== 0.25 && ratio !== 0.5 && ratio !== 0.75 && ratio !== 1) return null
  if (kind !== 'route-stamp' && ratio !== undefined) return null
  if (value.recovered !== undefined && typeof value.recovered !== 'boolean') return null
  return {
    id,
    kind,
    routeId,
    achievedAt,
    ratio: ratio as number | undefined,
    recovered: value.recovered as boolean | undefined,
  }
}

function validatePracticeHistoryEvent(value: unknown): PracticeHistoryEvent | null {
  if (!isRecord(value)) return null
  const id = asShortString(value.id, 180)
  const practicedAt = asShortString(value.practicedAt, 40)
  const stationId = asShortString(value.stationId, 120)
  const stationName = asShortString(value.stationName, 40)
  const kana = asShortString(value.kana, 8)
  const mode = value.mode === 'trace' || value.mode === 'free' ? value.mode : null
  if (!id || !practicedAt || !stationId || !stationName || !kana || !mode || !isHiraganaReading(kana) || !Number.isFinite(Date.parse(practicedAt))) return null
  if (!Number.isInteger(value.position) || (value.position as number) < 0 || (value.position as number) > 99) return null
  if (typeof value.freeWritten !== 'boolean' || (value.freeWritten && mode !== 'free')) return null
  return {
    id,
    practicedAt,
    stationId,
    stationName,
    kana: normalizeReading(kana),
    position: value.position as number,
    mode,
    freeWritten: value.freeWritten,
  }
}

export function parseBackup(text: string): PersistedState {
  if (new Blob([text]).size > MAX_IMPORT_BYTES) throw new Error('ファイルが おおきすぎます（2MBまで）')
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('JSONファイルを よみとれませんでした')
  }
  if (!isRecord(raw) || raw.schemaVersion !== 1) throw new Error('たいおうしていない データのバージョンです')
  const settings = validateSettings(raw.settings)
  const unlockSystemVersion = raw.unlockSystemVersion === undefined ? 1 : raw.unlockSystemVersion
  const unlockedMilestonesRaw = raw.unlockedMilestones ?? []
  const milestoneHistoryRaw = raw.milestoneHistory ?? []
  const practiceHistoryRaw = raw.practiceHistory ?? []
  if (!settings || !Array.isArray(raw.customStations) || !isRecord(raw.stationOverrides) || !isRecord(raw.progress)
    || !Number.isInteger(unlockSystemVersion) || (unlockSystemVersion as number) < 1 || (unlockSystemVersion as number) > UNLOCK_SYSTEM_VERSION
    || !Array.isArray(unlockedMilestonesRaw)
    || !unlockedMilestonesRaw.every((item) => typeof item === 'string' && item.length > 0 && item.length <= 100)
    || !Array.isArray(milestoneHistoryRaw) || milestoneHistoryRaw.length > 5000) {
    throw new Error('データの かたちが ただしくありません')
  }
  if (!Array.isArray(practiceHistoryRaw) || practiceHistoryRaw.length > 5000) {
    throw new Error('れんしゅうりれきの データが ただしくありません')
  }

  const allIds = new Set(builtInStationById.keys())
  const customStations: CustomStation[] = []
  for (const candidate of raw.customStations) {
    const station = validateCustomStation(candidate, allIds)
    if (!station) throw new Error('ついかした えきの データが ただしくありません')
    allIds.add(station.id)
    customStations.push(station)
  }
  for (const station of customStations) {
    if (station.insertAfterStationId && !allIds.has(station.insertAfterStationId)) {
      throw new Error('えきの いれるばしょが みつかりません')
    }
  }

  const stationOverrides: Record<string, StationOverride> = {}
  for (const [id, value] of Object.entries(raw.stationOverrides)) {
    if (!builtInStationById.has(id)) throw new Error('へんしゅうもとの えきが みつかりません')
    const override = validateOverride(value)
    if (!override) throw new Error('へんしゅうした えきの データが ただしくありません')
    stationOverrides[id] = override
  }

  const readings = new Map<string, string>()
  for (const [id, station] of builtInStationById) readings.set(id, stationOverrides[id]?.reading ?? station.reading)
  for (const station of customStations) readings.set(station.id, station.reading)

  const progress: Record<string, PracticeProgress> = {}
  for (const [id, value] of Object.entries(raw.progress)) {
    const reading = readings.get(id)
    if (!reading) throw new Error('れんしゅうした えきが みつかりません')
    const item = validateProgress(value, reading)
    if (!item) throw new Error('れんしゅうの データが ただしくありません')
    progress[id] = item
  }

  const milestoneHistory: MilestoneHistoryEvent[] = []
  const milestoneEventIds = new Set<string>()
  for (const value of milestoneHistoryRaw) {
    const event = validateMilestoneHistoryEvent(value)
    if (!event) throw new Error('できごとの データが ただしくありません')
    if (milestoneEventIds.has(event.id)) continue
    milestoneEventIds.add(event.id)
    milestoneHistory.push(event)
  }

  const practiceHistory: PracticeHistoryEvent[] = []
  const practiceEventIds = new Set<string>()
  for (const value of practiceHistoryRaw) {
    const event = validatePracticeHistoryEvent(value)
    if (!event) throw new Error('れんしゅうりれきの データが ただしくありません')
    if (practiceEventIds.has(event.id)) continue
    practiceEventIds.add(event.id)
    practiceHistory.push(event)
  }

  return {
    schemaVersion: 1,
    unlockSystemVersion: unlockSystemVersion as number,
    settings,
    customStations,
    stationOverrides,
    progress,
    practiceHistory,
    unlockedMilestones: [...new Set(unlockedMilestonesRaw as string[])],
    milestoneHistory,
  }
}

export function loadState(): { state: PersistedState; warning?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { state: defaultState() }
    return { state: parseBackup(raw) }
  } catch {
    return { state: defaultState(), warning: 'ほぞんデータを よめなかったので、さいしょの じょうたいで はじめました。' }
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function serializeBackup(state: PersistedState): string {
  return JSON.stringify(state, null, 2)
}
