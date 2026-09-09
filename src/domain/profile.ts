import { completedStationCount, isStationFreeWritten, isStationPracticed, practicedKanaSet, reconcileProgress, routeAchievementLevel, routeEffortProgress, type RouteAchievementLevel } from './progress'
import type { PracticeProgress, Route, Station } from './types'
import type { RouteCheckpointMilestone } from './unlocks'

export interface ProfileRouteInput {
  route: Route
  stationIds: readonly string[]
  unlocked: boolean
}

export interface ProfileCheckpoint {
  ratio: number
  earned: boolean
}

export interface ProfileRouteRecord {
  routeId: string
  operatorId: string
  name: string
  color: string
  unlocked: boolean
  achievement: RouteAchievementLevel
  completedStations: number
  totalStations: number
  practicedPositions: number
  freeWrittenPositions: number
  totalPositions: number
  ratio: number
  checkpoints: ProfileCheckpoint[]
}

export type ProfileGoalKind = 'checkpoint' | 'complete' | 'master'

export interface ProfileGoal {
  kind: ProfileGoalKind
  routeId: string
  routeName: string
  routeColor: string
  label: string
  current: number
  target: number
  remaining: number
}

export interface ProfileSnapshot {
  startedStations: number
  completedStations: number
  masteredStations: number
  practicedPositions: number
  practicedKana: Set<string>
  completedRoutes: number
  masteredRoutes: number
  earnedStamps: number
  routes: ProfileRouteRecord[]
  nextGoals: ProfileGoal[]
}

function freeWrittenPositionCount(
  stationIds: readonly string[],
  stationById: ReadonlyMap<string, Station>,
  progress: Record<string, PracticeProgress>,
): number {
  let total = 0
  for (const stationId of new Set(stationIds)) {
    const station = stationById.get(stationId)
    if (!station) continue
    total += reconcileProgress(progress[stationId], station.reading).freeWrittenPositions.length
  }
  return total
}

function goalForRoute(route: ProfileRouteRecord): ProfileGoal | null {
  if (!route.unlocked || route.totalPositions === 0 || route.achievement === 'master') return null

  if (route.achievement === 'complete') {
    return {
      kind: 'master',
      routeId: route.routeId,
      routeName: route.name,
      routeColor: route.color,
      label: 'ろせんマスター',
      current: route.freeWrittenPositions,
      target: route.totalPositions,
      remaining: Math.max(0, route.totalPositions - route.freeWrittenPositions),
    }
  }

  const nextCheckpoint = route.checkpoints.find((checkpoint) => !checkpoint.earned)
  if (nextCheckpoint) {
    const target = Math.ceil(route.totalPositions * nextCheckpoint.ratio)
    return {
      kind: 'checkpoint',
      routeId: route.routeId,
      routeName: route.name,
      routeColor: route.color,
      label: `${Math.round(nextCheckpoint.ratio * 100)}% くかんスタンプ`,
      current: Math.min(route.practicedPositions, target),
      target,
      remaining: Math.max(0, target - route.practicedPositions),
    }
  }

  return {
    kind: 'complete',
    routeId: route.routeId,
    routeName: route.name,
    routeColor: route.color,
    label: 'ぜんぶ クリア',
    current: route.practicedPositions,
    target: route.totalPositions,
    remaining: Math.max(0, route.totalPositions - route.practicedPositions),
  }
}

export function buildProfileSnapshot(
  stations: readonly Station[],
  routeInputs: readonly ProfileRouteInput[],
  progress: Record<string, PracticeProgress>,
  unlockedMilestones: readonly string[],
  checkpointMilestones: readonly RouteCheckpointMilestone[],
): ProfileSnapshot {
  const stationById = new Map(stations.map((station) => [station.id, station]))
  const unlockedIds = new Set(unlockedMilestones)
  let startedStations = 0
  let completedStations = 0
  let masteredStations = 0
  let practicedPositions = 0

  for (const station of stations) {
    const current = reconcileProgress(progress[station.id], station.reading)
    if (current.practicedPositions.length > 0) startedStations += 1
    if (isStationPracticed(current, station.reading)) completedStations += 1
    if (isStationFreeWritten(current, station.reading)) masteredStations += 1
    practicedPositions += current.practicedPositions.length
  }

  const routeRecords = routeInputs.map(({ route, stationIds, unlocked }): ProfileRouteRecord => {
    const effort = routeEffortProgress(stationIds, stationById, progress)
    const checkpoints = checkpointMilestones
      .filter((milestone) => milestone.routeId === route.id)
      .sort((left, right) => left.ratio - right.ratio)
      .map((milestone) => ({ ratio: milestone.ratio, earned: unlockedIds.has(milestone.id) }))
    return {
      routeId: route.id,
      operatorId: route.operatorId,
      name: route.name,
      color: route.color,
      unlocked,
      achievement: routeAchievementLevel([...stationIds], stationById, progress),
      completedStations: completedStationCount([...stationIds], stationById, progress),
      totalStations: new Set(stationIds).size,
      practicedPositions: effort.practicedPositions,
      freeWrittenPositions: freeWrittenPositionCount(stationIds, stationById, progress),
      totalPositions: effort.totalPositions,
      ratio: effort.ratio,
      checkpoints,
    }
  })
  const nextGoals = routeRecords
    .map(goalForRoute)
    .filter((goal): goal is ProfileGoal => goal !== null)
    .sort((left, right) => left.remaining - right.remaining || left.target - right.target || left.routeName.localeCompare(right.routeName, 'ja'))

  return {
    startedStations,
    completedStations,
    masteredStations,
    practicedPositions,
    practicedKana: practicedKanaSet(stations, progress),
    completedRoutes: routeRecords.filter((route) => route.unlocked && route.achievement !== 'none').length,
    masteredRoutes: routeRecords.filter((route) => route.unlocked && route.achievement === 'master').length,
    earnedStamps: checkpointMilestones.filter((milestone) => unlockedIds.has(milestone.id)).length,
    routes: routeRecords,
    nextGoals,
  }
}
