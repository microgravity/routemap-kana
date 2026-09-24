import {
  campaignRouteUnlockMilestoneId,
  routeChoiceCampaigns,
  TOKYO_METRO_CHOICE_ROUTE_IDS,
  TOKYO_METRO_STARTER_ROUTE_IDS,
  TOKYO_METRO_UNLOCK_MILESTONE_ID,
  type RouteChoiceCampaign,
} from '../config/unlockCampaigns'
import { routeAchievementLevel, routeEffortProgress, type RouteAchievementLevel } from './progress'
import type { PracticeProgress, RailwayOperator, Route, Station } from './types'

export { TOKYO_METRO_CHOICE_ROUTE_IDS, TOKYO_METRO_STARTER_ROUTE_IDS, TOKYO_METRO_UNLOCK_MILESTONE_ID }

export const UNLOCK_SYSTEM_VERSION = 2
export const ROUTE_CHECKPOINT_RATIOS = [0.25, 0.5, 0.75, 1] as const
export type RouteCheckpointRatio = typeof ROUTE_CHECKPOINT_RATIOS[number]

export type UnlockCondition =
  | { kind: 'route-achievement'; routeId: string; level: Exclude<RouteAchievementLevel, 'none'> }
  | { kind: 'route-effort'; routeId: string; ratio: RouteCheckpointRatio }
  | { kind: 'all'; conditions: UnlockCondition[] }
  | { kind: 'any'; conditions: UnlockCondition[] }

export interface UnlockMilestone { id: string; title: string; description: string; condition: UnlockCondition }
export interface UnlockContext { routes: readonly Route[]; stationById: ReadonlyMap<string, Station>; progress: Record<string, PracticeProgress> }
export interface UnlockProgress { completed: number; total: number; earned: boolean }
export interface RouteCheckpointMilestone extends UnlockMilestone { routeId: string; ratio: RouteCheckpointRatio; stampNumber: number }
export interface RouteChoiceStatus { earnedStamps: number; unlockedChoices: number; availableChoices: number; nextStampTarget?: number }
export type MetroUnlockStatus = RouteChoiceStatus

export function routeUnlockMilestoneId(campaign: RouteChoiceCampaign, routeId: string): string {
  return campaignRouteUnlockMilestoneId(campaign.id, routeId)
}

export function metroRouteUnlockMilestoneId(routeId: string): string {
  return campaignRouteUnlockMilestoneId('tokyo-metro-v1', routeId)
}

function routeCheckpointMilestoneId(routeId: string, ratio: RouteCheckpointRatio): string {
  return `route-checkpoint-${routeId}-${Math.round(ratio * 100)}-v1`
}

const checkpointRouteIds = [...new Set(routeChoiceCampaigns.flatMap((campaign) => [
  ...campaign.prerequisiteRouteIds,
  ...campaign.stampRouteIds,
]))]
export const routeCheckpointMilestones: RouteCheckpointMilestone[] = checkpointRouteIds.flatMap((routeId) => (
  ROUTE_CHECKPOINT_RATIOS.map((ratio, index) => ({
    id: routeCheckpointMilestoneId(routeId, ratio),
    title: `${Math.round(ratio * 100)}% くかんスタンプ`,
    description: 'れんしゅうした もじの すすみぐあいで もらえるスタンプ',
    routeId,
    ratio,
    stampNumber: index + 1,
    condition: { kind: 'route-effort' as const, routeId, ratio },
  }))
))

export function checkpointMilestonesForCampaign(campaign: RouteChoiceCampaign): RouteCheckpointMilestone[] {
  const routeIds = new Set(campaign.stampRouteIds)
  return routeCheckpointMilestones.filter((milestone) => routeIds.has(milestone.routeId))
}

const campaignUnlockMilestones: UnlockMilestone[] = routeChoiceCampaigns.map((campaign) => ({
  id: campaign.unlockMilestoneId,
  title: campaign.title,
  description: campaign.description,
  condition: {
    kind: 'all',
    conditions: campaign.prerequisiteRouteIds.map((routeId) => ({ kind: 'route-achievement', routeId, level: 'complete' })),
  },
}))

export const unlockMilestones: UnlockMilestone[] = [...campaignUnlockMilestones, ...routeCheckpointMilestones]
export const unlockMilestoneById = new Map(unlockMilestones.map((milestone) => [milestone.id, milestone]))
export const routeCheckpointMilestoneById = new Map(routeCheckpointMilestones.map((milestone) => [milestone.id, milestone]))
const achievementRank: Record<RouteAchievementLevel, number> = { none: 0, complete: 1, master: 2 }

export function isUnlockConditionMet(condition: UnlockCondition, context: UnlockContext): boolean {
  if (condition.kind === 'all') return condition.conditions.every((item) => isUnlockConditionMet(item, context))
  if (condition.kind === 'any') return condition.conditions.some((item) => isUnlockConditionMet(item, context))
  const route = context.routes.find((item) => item.id === condition.routeId)
  if (!route) return false
  if (condition.kind === 'route-effort') return routeEffortProgress(route.orderedStationIds, context.stationById, context.progress).ratio >= condition.ratio
  return achievementRank[routeAchievementLevel(route.orderedStationIds, context.stationById, context.progress)] >= achievementRank[condition.level]
}

export function unlockProgress(milestone: UnlockMilestone, context: UnlockContext): UnlockProgress {
  const conditions = milestone.condition.kind === 'all' ? milestone.condition.conditions : [milestone.condition]
  const completed = conditions.filter((condition) => isUnlockConditionMet(condition, context)).length
  return { completed, total: conditions.length, earned: isUnlockConditionMet(milestone.condition, context) }
}

export function grantEarnedMilestones(currentIds: readonly string[], context: UnlockContext): string[] {
  const granted = new Set(currentIds)
  for (const milestone of unlockMilestones) if (isUnlockConditionMet(milestone.condition, context)) granted.add(milestone.id)
  return [...granted]
}

export function routeChoiceStatus(campaign: RouteChoiceCampaign, unlockedMilestones: readonly string[]): RouteChoiceStatus {
  const earnedStamps = checkpointMilestonesForCampaign(campaign).filter((milestone) => unlockedMilestones.includes(milestone.id)).length
  const unlockedChoices = campaign.choiceRouteIds.filter((routeId) => unlockedMilestones.includes(routeUnlockMilestoneId(campaign, routeId))).length
  const earnedChoices = campaign.ticketThresholds.filter((threshold) => earnedStamps >= threshold).length
  return {
    earnedStamps,
    unlockedChoices,
    availableChoices: Math.max(0, earnedChoices - unlockedChoices),
    nextStampTarget: campaign.ticketThresholds[unlockedChoices],
  }
}

export function grantRouteChoice(currentIds: readonly string[], campaign: RouteChoiceCampaign, routeId: string): string[] {
  if (!campaign.choiceRouteIds.includes(routeId)) return [...currentIds]
  const milestoneId = routeUnlockMilestoneId(campaign, routeId)
  if (currentIds.includes(milestoneId) || routeChoiceStatus(campaign, currentIds).availableChoices < 1) return [...currentIds]
  return [...new Set([...currentIds, milestoneId])]
}

export function migrateUnlockMilestones(currentIds: readonly string[], fromVersion: number): string[] {
  const migrated = new Set(currentIds)
  for (const campaign of routeChoiceCampaigns) {
    const cutoff = campaign.migration?.grantAllChoicesBeforeVersion
    if (cutoff === undefined || fromVersion >= cutoff || !migrated.has(campaign.unlockMilestoneId)) continue
    for (const routeId of campaign.choiceRouteIds) migrated.add(routeUnlockMilestoneId(campaign, routeId))
  }
  return [...migrated]
}

export function isOperatorUnlocked(operator: RailwayOperator, unlockedMilestones: readonly string[]): boolean {
  return !operator.unlockMilestoneId || unlockedMilestones.includes(operator.unlockMilestoneId)
}

export function isRouteUnlocked(route: Route, operators: readonly RailwayOperator[], unlockedMilestones: readonly string[]): boolean {
  const operator = operators.find((item) => item.id === route.operatorId)
  return Boolean(operator && isOperatorUnlocked(operator, unlockedMilestones) && (!route.unlockMilestoneId || unlockedMilestones.includes(route.unlockMilestoneId)))
}

// 公開済みAPIと保存IDを保つ互換ラッパー。新規キャンペーンは上の汎用APIを使う。
const tokyoMetroCampaign = routeChoiceCampaigns.find((campaign) => campaign.operatorId === 'tokyo-metro')!
export const metroRouteCheckpointMilestones = checkpointMilestonesForCampaign(tokyoMetroCampaign)
export function metroUnlockStatus(unlockedMilestones: readonly string[]): RouteChoiceStatus { return routeChoiceStatus(tokyoMetroCampaign, unlockedMilestones) }
export function grantMetroRouteChoice(currentIds: readonly string[], routeId: string): string[] { return grantRouteChoice(currentIds, tokyoMetroCampaign, routeId) }
