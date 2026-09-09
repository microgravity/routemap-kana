import { routeAchievementLevel, type RouteAchievementLevel } from './progress'
import type { PracticeProgress, RailwayOperator, Route, Station } from './types'

export const TOKYO_METRO_UNLOCK_MILESTONE_ID = 'tokyo-metro-unlock-v1'

export type UnlockCondition =
  | { kind: 'route-achievement'; routeId: string; level: Exclude<RouteAchievementLevel, 'none'> }
  | { kind: 'all'; conditions: UnlockCondition[] }
  | { kind: 'any'; conditions: UnlockCondition[] }

export interface UnlockMilestone {
  id: string
  title: string
  description: string
  condition: UnlockCondition
}

export interface UnlockContext {
  routes: readonly Route[]
  stationById: ReadonlyMap<string, Station>
  progress: Record<string, PracticeProgress>
}

export interface UnlockProgress {
  completed: number
  total: number
  earned: boolean
}

const prerequisiteRouteIds = [
  'toyoko', 'meguro', 'shinyokohama', 'denentoshi', 'oimachi', 'ikegami', 'tamagawa', 'setagaya', 'kodomonokuni',
  'sotetsu-main', 'sotetsu-izumino', 'sotetsu-shinyokohama',
]

export const unlockMilestones: UnlockMilestone[] = [
  {
    id: TOKYO_METRO_UNLOCK_MILESTONE_ID,
    title: 'とうきょうメトロ',
    description: 'とうきゅう・そうてつを ぜんぶ クリア',
    condition: {
      kind: 'all',
      conditions: prerequisiteRouteIds.map((routeId) => ({ kind: 'route-achievement', routeId, level: 'complete' })),
    },
  },
]

export const unlockMilestoneById = new Map(unlockMilestones.map((milestone) => [milestone.id, milestone]))

const achievementRank: Record<RouteAchievementLevel, number> = { none: 0, complete: 1, master: 2 }

export function isUnlockConditionMet(condition: UnlockCondition, context: UnlockContext): boolean {
  if (condition.kind === 'all') return condition.conditions.every((item) => isUnlockConditionMet(item, context))
  if (condition.kind === 'any') return condition.conditions.some((item) => isUnlockConditionMet(item, context))
  const route = context.routes.find((item) => item.id === condition.routeId)
  if (!route) return false
  const level = routeAchievementLevel(route.orderedStationIds, context.stationById, context.progress)
  return achievementRank[level] >= achievementRank[condition.level]
}

export function unlockProgress(milestone: UnlockMilestone, context: UnlockContext): UnlockProgress {
  const conditions = milestone.condition.kind === 'all' ? milestone.condition.conditions : [milestone.condition]
  const completed = conditions.filter((condition) => isUnlockConditionMet(condition, context)).length
  return { completed, total: conditions.length, earned: isUnlockConditionMet(milestone.condition, context) }
}

export function grantEarnedMilestones(currentIds: readonly string[], context: UnlockContext): string[] {
  const granted = new Set(currentIds)
  for (const milestone of unlockMilestones) {
    if (isUnlockConditionMet(milestone.condition, context)) granted.add(milestone.id)
  }
  return [...granted]
}

export function isOperatorUnlocked(operator: RailwayOperator, unlockedMilestones: readonly string[]): boolean {
  return !operator.unlockMilestoneId || unlockedMilestones.includes(operator.unlockMilestoneId)
}

export function isRouteUnlocked(route: Route, operators: readonly RailwayOperator[], unlockedMilestones: readonly string[]): boolean {
  const operator = operators.find((item) => item.id === route.operatorId)
  return Boolean(
    operator
    && isOperatorUnlocked(operator, unlockedMilestones)
    && (!route.unlockMilestoneId || unlockedMilestones.includes(route.unlockMilestoneId)),
  )
}
