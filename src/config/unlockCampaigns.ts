export interface RouteChoiceCampaign {
  id: string
  operatorId: string
  unlockMilestoneId: string
  title: string
  description: string
  prerequisiteRouteIds: readonly string[]
  starterRouteIds: readonly string[]
  choiceRouteIds: readonly string[]
  stampRouteIds: readonly string[]
  ticketThresholds: readonly number[]
  migration?: {
    grantAllChoicesBeforeVersion: number
  }
}

export const TOKYO_METRO_UNLOCK_MILESTONE_ID = 'tokyo-metro-unlock-v1'
export const TOKYO_METRO_STARTER_ROUTE_IDS = ['metro-hanzomon', 'metro-ginza'] as const
export const TOKYO_METRO_CHOICE_ROUTE_IDS = [
  'metro-marunouchi',
  'metro-hibiya',
  'metro-tozai',
  'metro-chiyoda',
  'metro-yurakucho',
  'metro-namboku',
  'metro-fukutoshin',
] as const

const tokyoMetroPrerequisiteRouteIds = [
  'toyoko', 'meguro', 'shinyokohama', 'denentoshi', 'oimachi', 'ikegami', 'tamagawa', 'setagaya', 'kodomonokuni',
  'sotetsu-main', 'sotetsu-izumino', 'sotetsu-shinyokohama',
] as const

export function campaignRouteUnlockMilestoneId(campaignId: string, routeId: string): string {
  // 公開済みの東京メトロ解除IDはlocalStorage互換のため維持する。
  if (campaignId === 'tokyo-metro-v1') return `tokyo-metro-route-${routeId}-unlock-v1`
  return `campaign-${campaignId}-route-${routeId}-unlock-v1`
}

export const routeChoiceCampaigns: readonly RouteChoiceCampaign[] = [{
  id: 'tokyo-metro-v1',
  operatorId: 'tokyo-metro',
  unlockMilestoneId: TOKYO_METRO_UNLOCK_MILESTONE_ID,
  title: 'とうきょうメトロ',
  description: 'とうきゅう・そうてつを ぜんぶ クリア',
  prerequisiteRouteIds: tokyoMetroPrerequisiteRouteIds,
  starterRouteIds: TOKYO_METRO_STARTER_ROUTE_IDS,
  choiceRouteIds: TOKYO_METRO_CHOICE_ROUTE_IDS,
  stampRouteIds: [...TOKYO_METRO_STARTER_ROUTE_IDS, ...TOKYO_METRO_CHOICE_ROUTE_IDS],
  ticketThresholds: TOKYO_METRO_CHOICE_ROUTE_IDS.map((_, index) => 2 + (index * 3)),
  migration: { grantAllChoicesBeforeVersion: 2 },
}]

export const routeChoiceCampaignByOperatorId = new Map(
  routeChoiceCampaigns.map((campaign) => [campaign.operatorId, campaign]),
)
