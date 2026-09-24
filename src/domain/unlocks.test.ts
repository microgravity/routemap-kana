import { builtInStationById, railwayOperators, routes } from '../data/stations'
import { completePosition, freshProgress } from './progress'
import type { PracticeProgress } from './types'
import { routeChoiceCampaignByOperatorId, TOEI_SUBWAY_CHOICE_ROUTE_IDS, TOEI_SUBWAY_STARTER_ROUTE_IDS, TOEI_SUBWAY_UNLOCK_MILESTONE_ID } from '../config/unlockCampaigns'
import {
  TOKYO_METRO_CHOICE_ROUTE_IDS,
  TOKYO_METRO_UNLOCK_MILESTONE_ID,
  UNLOCK_SYSTEM_VERSION,
  grantRouteChoice,
  grantEarnedMilestones,
  isOperatorUnlocked,
  isRouteUnlocked,
  metroRouteUnlockMilestoneId,
  metroRouteCheckpointMilestones,
  metroUnlockStatus,
  migrateUnlockMilestones,
  unlockMilestoneById,
  unlockProgress,
  routeChoiceStatus,
} from './unlocks'

function completedProgressFor(stationId: string) {
  const station = builtInStationById.get(stationId)!
  return Array.from(station.reading).reduce(
    (progress, _, position) => completePosition(progress, position),
    freshProgress(station.reading),
  )
}

function completedPrerequisiteProgress() {
  const routeIds = new Set([
    'toyoko', 'meguro', 'shinyokohama', 'denentoshi', 'oimachi', 'ikegami', 'tamagawa', 'setagaya', 'kodomonokuni',
    'sotetsu-main', 'sotetsu-izumino', 'sotetsu-shinyokohama',
  ])
  const stationIds = new Set(routes.filter((route) => routeIds.has(route.id)).flatMap((route) => route.orderedStationIds))
  return Object.fromEntries([...stationIds].map((stationId) => [stationId, completedProgressFor(stationId)]))
}

function completedRoutesProgress(routeIds: readonly string[]) {
  const selected = new Set(routeIds)
  const stationIds = new Set(routes.filter((route) => selected.has(route.id)).flatMap((route) => route.orderedStationIds))
  return Object.fromEntries([...stationIds].map((stationId) => [stationId, completedProgressFor(stationId)]))
}

function progressForRouteRatio(routeId: string, ratio: number) {
  const route = routes.find((item) => item.id === routeId)!
  const stations = [...new Set(route.orderedStationIds)].map((stationId) => builtInStationById.get(stationId)!)
  const target = Math.ceil(stations.reduce((sum, station) => sum + Array.from(station.reading).length, 0) * ratio)
  let remaining = target
  const progress: Record<string, PracticeProgress> = {}
  for (const station of stations) {
    if (remaining <= 0) break
    const count = Math.min(remaining, Array.from(station.reading).length)
    let current = freshProgress(station.reading)
    for (let position = 0; position < count; position += 1) current = completePosition(current, position)
    progress[station.id] = current
    remaining -= count
  }
  return progress
}

describe('コンテンツ解除', () => {
  const milestone = unlockMilestoneById.get(TOKYO_METRO_UNLOCK_MILESTONE_ID)!
  const metro = railwayOperators.find((operator) => operator.id === 'tokyo-metro')!

  it('東急9路線・相鉄3路線の通常クリアで東京メトロを解除する', () => {
    const progress = completedPrerequisiteProgress()
    const context = { routes, stationById: builtInStationById, progress }
    expect(unlockProgress(milestone, context)).toEqual({ completed: 12, total: 12, earned: true })
    expect(grantEarnedMilestones([], context)).toContain(TOKYO_METRO_UNLOCK_MILESTONE_ID)
    expect(isOperatorUnlocked(metro, grantEarnedMilestones([], context))).toBe(true)
  })

  it('一つでも未クリアの路線があれば解除せず残り路線数を返す', () => {
    const progress = completedPrerequisiteProgress()
    delete progress['tokyu-ty02']
    const context = { routes, stationById: builtInStationById, progress }
    expect(unlockProgress(milestone, context)).toEqual({ completed: 11, total: 12, earned: false })
    expect(isOperatorUnlocked(metro, [])).toBe(false)
  })

  it('一度獲得した解除は路線や駅の追加後も取り消さない', () => {
    const context = { routes, stationById: builtInStationById, progress: {} }
    expect(grantEarnedMilestones([TOKYO_METRO_UNLOCK_MILESTONE_ID], context)).toEqual([TOKYO_METRO_UNLOCK_MILESTONE_ID])
  })

  it('解除条件は将来追加される路線を暗黙に含めない', () => {
    expect(milestone.condition.kind).toBe('all')
    if (milestone.condition.kind !== 'all') return
    const requiredRouteIds = milestone.condition.conditions.flatMap((condition) => condition.kind === 'route-achievement' ? [condition.routeId] : [])
    expect(requiredRouteIds).toHaveLength(12)
    expect(requiredRouteIds.some((routeId) => routeId.startsWith('metro-'))).toBe(false)
  })

  it('メトロは短い2路線から始まり、文字位置50%でスタンプ2個と選択きっぷを得る', () => {
    const campaign = routeChoiceCampaignByOperatorId.get('tokyo-metro')!
    const operatorUnlocked = [TOKYO_METRO_UNLOCK_MILESTONE_ID]
    const ginza = routes.find((route) => route.id === 'metro-ginza')!
    const hanzomon = routes.find((route) => route.id === 'metro-hanzomon')!
    const marunouchi = routes.find((route) => route.id === 'metro-marunouchi')!
    expect(isRouteUnlocked(ginza, railwayOperators, operatorUnlocked)).toBe(true)
    expect(isRouteUnlocked(hanzomon, railwayOperators, operatorUnlocked)).toBe(true)
    expect(isRouteUnlocked(marunouchi, railwayOperators, operatorUnlocked)).toBe(false)

    const earned = grantEarnedMilestones(operatorUnlocked, {
      routes,
      stationById: builtInStationById,
      progress: progressForRouteRatio('metro-hanzomon', 0.5),
    })
    expect(routeChoiceStatus(campaign, earned)).toMatchObject({ earnedStamps: 2, unlockedChoices: 0, availableChoices: 1 })
    const selected = grantRouteChoice(earned, campaign, 'metro-marunouchi')
    expect(isRouteUnlocked(marunouchi, railwayOperators, selected)).toBe(true)
    expect(routeChoiceStatus(campaign, selected)).toMatchObject({ earnedStamps: 2, unlockedChoices: 1, availableChoices: 0, nextStampTarget: 5 })
  })

  it('路線選択きっぷは2個、その後は3個ごとのスタンプで増える', () => {
    const campaign = routeChoiceCampaignByOperatorId.get('tokyo-metro')!
    const ids = metroRouteCheckpointMilestones.slice(0, 8).map((milestone) => milestone.id)
    expect(routeChoiceStatus(campaign, ids)).toMatchObject({ earnedStamps: 8, availableChoices: 3 })
    const first = grantRouteChoice(ids, campaign, 'metro-marunouchi')
    const second = grantRouteChoice(first, campaign, 'metro-hibiya')
    const third = grantRouteChoice(second, campaign, 'metro-tozai')
    expect(routeChoiceStatus(campaign, third)).toMatchObject({ earnedStamps: 8, unlockedChoices: 3, availableChoices: 0, nextStampTarget: 11 })
    expect(metroUnlockStatus(third)).toEqual(routeChoiceStatus(campaign, third))
  })

  it('旧版ですでにメトロ解除済みなら全路線を維持し、新版の新規解除では段階制にする', () => {
    const legacy = migrateUnlockMilestones([TOKYO_METRO_UNLOCK_MILESTONE_ID], 1)
    expect(TOKYO_METRO_CHOICE_ROUTE_IDS.every((routeId) => legacy.includes(metroRouteUnlockMilestoneId(routeId)))).toBe(true)
    expect(migrateUnlockMilestones([TOKYO_METRO_UNLOCK_MILESTONE_ID], UNLOCK_SYSTEM_VERSION)).toEqual([TOKYO_METRO_UNLOCK_MILESTONE_ID])
  })

  it('東京メトロの好きな3路線クリアで都営地下鉄を解除する', () => {
    const toeiMilestone = unlockMilestoneById.get(TOEI_SUBWAY_UNLOCK_MILESTONE_ID)!
    const toei = railwayOperators.find((operator) => operator.id === 'jp.operator.toei')!
    const twoRoutes = completedRoutesProgress(['metro-ginza', 'metro-hanzomon'])
    const threeRoutes = completedRoutesProgress(['metro-ginza', 'metro-hanzomon', 'metro-fukutoshin'])

    expect(unlockProgress(toeiMilestone, { routes, stationById: builtInStationById, progress: twoRoutes }))
      .toEqual({ completed: 2, total: 3, earned: false })
    const earned = grantEarnedMilestones([], { routes, stationById: builtInStationById, progress: threeRoutes })
    expect(earned).toContain(TOEI_SUBWAY_UNLOCK_MILESTONE_ID)
    expect(isOperatorUnlocked(toei, earned)).toBe(true)
  })

  it('都営地下鉄は浅草線から始まり、スタンプ1・3・5個で残り3路線を選べる', () => {
    const campaign = routeChoiceCampaignByOperatorId.get('jp.operator.toei')!
    const operatorUnlocked = [TOEI_SUBWAY_UNLOCK_MILESTONE_ID]
    const starter = routes.find((route) => route.id === TOEI_SUBWAY_STARTER_ROUTE_IDS[0])!
    const choice = routes.find((route) => route.id === TOEI_SUBWAY_CHOICE_ROUTE_IDS[0])!

    expect(isRouteUnlocked(starter, railwayOperators, operatorUnlocked)).toBe(true)
    expect(isRouteUnlocked(choice, railwayOperators, operatorUnlocked)).toBe(false)
    const earned = grantEarnedMilestones(operatorUnlocked, {
      routes,
      stationById: builtInStationById,
      progress: progressForRouteRatio(starter.id, 0.25),
    })
    expect(routeChoiceStatus(campaign, earned)).toMatchObject({ earnedStamps: 1, availableChoices: 1, nextStampTarget: 1 })
    const selected = grantRouteChoice(earned, campaign, choice.id)
    expect(isRouteUnlocked(choice, railwayOperators, selected)).toBe(true)
    expect(routeChoiceStatus(campaign, selected)).toMatchObject({ earnedStamps: 1, unlockedChoices: 1, availableChoices: 0, nextStampTarget: 3 })
  })
})
