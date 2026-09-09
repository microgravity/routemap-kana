import { routeAchievementLevel, type RouteAchievement, type RouteProgressDefinition } from './progress'
import type { MilestoneHistoryEvent, PracticeProgress, Station } from './types'
import type { RouteCheckpointMilestone } from './unlocks'

function achievementEventId(routeId: string, level: 'complete' | 'master'): string {
  return `route-achievement-${routeId}-${level}-v1`
}

export function milestoneEventsForPracticeResult(
  routeAchievements: readonly RouteAchievement[],
  unlockedMilestoneIds: readonly string[],
  checkpointById: ReadonlyMap<string, RouteCheckpointMilestone>,
  achievedAt: string,
): MilestoneHistoryEvent[] {
  const checkpointEvents = unlockedMilestoneIds.flatMap((id): MilestoneHistoryEvent[] => {
    const checkpoint = checkpointById.get(id)
    return checkpoint ? [{
      id: checkpoint.id,
      kind: 'route-stamp',
      routeId: checkpoint.routeId,
      ratio: checkpoint.ratio,
      achievedAt,
    }] : []
  })
  const achievementEvents = routeAchievements.map((achievement): MilestoneHistoryEvent => ({
    id: achievementEventId(achievement.routeId, achievement.level),
    kind: achievement.level === 'master' ? 'route-master' : 'route-complete',
    routeId: achievement.routeId,
    achievedAt,
  }))
  return [...checkpointEvents, ...achievementEvents]
}

export function appendMilestoneHistory(
  current: readonly MilestoneHistoryEvent[],
  additions: readonly MilestoneHistoryEvent[],
): MilestoneHistoryEvent[] {
  const existingIds = new Set(current.map((event) => event.id))
  return [...current, ...additions.filter((event) => {
    if (existingIds.has(event.id)) return false
    existingIds.add(event.id)
    return true
  })]
}

export function formatMilestoneDate(isoDate: string): string {
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date(isoDate))
  const number = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value)
  const year = number('year')
  const month = number('month')
  const day = number('day')
  const daySuffix = [2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 20, 24].includes(day) ? 'か' : 'にち'
  return `${year}ねん ${month}がつ${day}${daySuffix}`
}

function latestStationStart(
  stationIds: readonly string[],
  progress: Record<string, PracticeProgress>,
): string | null {
  const dates = [...new Set(stationIds)].map((stationId) => progress[stationId]?.addedAt)
  if (dates.length === 0) return null
  if (dates.some((date) => !date || !Number.isFinite(Date.parse(date)))) return null
  return dates.reduce<string>((latest, date) => Date.parse(date!) > Date.parse(latest) ? date! : latest, dates[0]!)
}

/** 追加前からクリア済みだった路線だけ、駅の保存日を使って過去履歴へ復元する。 */
export function recoverRouteAchievementHistory(
  current: readonly MilestoneHistoryEvent[],
  definitions: readonly RouteProgressDefinition[],
  stationById: ReadonlyMap<string, Station>,
  progress: Record<string, PracticeProgress>,
): MilestoneHistoryEvent[] {
  const recovered = definitions.flatMap(({ routeId, stationIds }): MilestoneHistoryEvent[] => {
    const level = routeAchievementLevel(stationIds, stationById, progress)
    if (level === 'none') return []
    const achievedAt = latestStationStart(stationIds, progress)
    if (!achievedAt) return []
    const complete: MilestoneHistoryEvent = {
      id: achievementEventId(routeId, 'complete'),
      kind: 'route-complete',
      routeId,
      achievedAt,
      recovered: true,
    }
    if (level === 'complete') return [complete]
    return [complete, {
      id: achievementEventId(routeId, 'master'),
      kind: 'route-master',
      routeId,
      achievedAt,
      recovered: true,
    }]
  })
  return appendMilestoneHistory(current, recovered)
}
