import { completeFreeWrittenPosition, completePosition, freshProgress } from './progress'
import { buildProfileSnapshot } from './profile'
import type { PracticeProgress, Route, Station } from './types'
import type { RouteCheckpointMilestone } from './unlocks'

function route(id: string, stationIds: string[]): Route {
  return {
    id,
    operatorId: 'company',
    name: `${id}せん`,
    color: '#338e82',
    segmentLabel: 'てすと',
    orderedStationIds: stationIds,
    stationCodes: stationIds.map((_, index) => String(index + 1)),
    sourceUrl: 'https://example.com/',
  }
}

function checkpoint(routeId: string, ratio: 0.25 | 0.5 | 0.75 | 1): RouteCheckpointMilestone {
  return {
    id: `stamp-${routeId}-${ratio}`,
    routeId,
    ratio,
    stampNumber: ratio * 4,
    title: 'スタンプ',
    description: 'テスト',
    condition: { kind: 'route-effort', routeId, ratio },
  }
}

describe('プロフィール集計', () => {
  const stations: Station[] = [
    { id: 'shared', displayName: '共有', reading: 'あ', builtIn: true },
    { id: 'long', displayName: '途中', reading: 'いえお', builtIn: true },
    { id: 'custom', displayName: '追加', reading: 'か', builtIn: false },
  ]
  const firstRoute = route('first', ['shared', 'long', 'custom'])
  const secondRoute = route('second', ['shared', 'custom'])
  const checkpoints = [0.25, 0.5, 0.75, 1].flatMap((ratio) => [
    checkpoint('first', ratio as 0.25 | 0.5 | 0.75 | 1),
    checkpoint('second', ratio as 0.25 | 0.5 | 0.75 | 1),
  ])

  it('共有駅を全体で重複せず、カスタム駅と文字位置を集計する', () => {
    const progress: Record<string, PracticeProgress> = {
      shared: completePosition(freshProgress('あ'), 0),
      long: completePosition(freshProgress('いえお'), 0),
      custom: completeFreeWrittenPosition(freshProgress('か'), 0),
    }
    const snapshot = buildProfileSnapshot(
      stations,
      [
        { route: firstRoute, stationIds: firstRoute.orderedStationIds, unlocked: true },
        { route: secondRoute, stationIds: secondRoute.orderedStationIds, unlocked: true },
      ],
      progress,
      ['stamp-first-0.25', 'stamp-first-0.5'],
      checkpoints,
    )

    expect(snapshot).toMatchObject({
      startedStations: 3,
      completedStations: 2,
      masteredStations: 1,
      practicedPositions: 3,
      completedRoutes: 1,
      masteredRoutes: 0,
      earnedStamps: 2,
    })
    expect(snapshot.practicedKana).toEqual(new Set(['あ', 'い', 'か']))
    expect(snapshot.routes[0]).toMatchObject({ completedStations: 2, totalStations: 3, practicedPositions: 3, totalPositions: 5 })
    expect(snapshot.routes[1]).toMatchObject({ completedStations: 2, totalStations: 2, achievement: 'complete' })
  })

  it('残り文字が少ない順に、スタンプとマスターを次の目標にする', () => {
    const progress: Record<string, PracticeProgress> = {
      shared: completePosition(freshProgress('あ'), 0),
      long: completePosition(freshProgress('いえお'), 0),
      custom: completeFreeWrittenPosition(freshProgress('か'), 0),
    }
    const snapshot = buildProfileSnapshot(
      stations,
      [
        { route: firstRoute, stationIds: firstRoute.orderedStationIds, unlocked: true },
        { route: secondRoute, stationIds: secondRoute.orderedStationIds, unlocked: true },
      ],
      progress,
      ['stamp-first-0.25', 'stamp-first-0.5'],
      checkpoints,
    )

    expect(snapshot.nextGoals[0]).toMatchObject({ routeId: 'second', kind: 'master', remaining: 1 })
    expect(snapshot.nextGoals[1]).toMatchObject({ routeId: 'first', label: '75% くかんスタンプ', remaining: 1 })
  })

  it('ロック中の路線を次の目標に含めない', () => {
    const complete = {
      shared: completePosition(freshProgress('あ'), 0),
      long: completePosition(completePosition(completePosition(freshProgress('いえお'), 0), 1), 2),
      custom: completePosition(freshProgress('か'), 0),
    }
    const snapshot = buildProfileSnapshot(
      stations,
      [{ route: firstRoute, stationIds: firstRoute.orderedStationIds, unlocked: false }],
      complete,
      [],
      checkpoints,
    )
    expect(snapshot.nextGoals).toEqual([])
    expect(snapshot.completedRoutes).toBe(0)
  })
})
