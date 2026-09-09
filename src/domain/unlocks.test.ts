import { builtInStationById, railwayOperators, routes } from '../data/stations'
import { completePosition, freshProgress } from './progress'
import {
  TOKYO_METRO_UNLOCK_MILESTONE_ID,
  grantEarnedMilestones,
  isOperatorUnlocked,
  unlockMilestoneById,
  unlockProgress,
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
})
