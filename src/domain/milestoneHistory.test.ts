import { appendMilestoneHistory, formatMilestoneDate, milestoneEventsForPracticeResult, recoverRouteAchievementHistory } from './milestoneHistory'
import { completeFreeWrittenPosition, completePosition, freshProgress } from './progress'
import type { PracticeProgress, Station } from './types'
import type { RouteCheckpointMilestone } from './unlocks'

const achievedAt = '2026-09-05T08:30:00.000Z'
const checkpoint: RouteCheckpointMilestone = {
  id: 'route-checkpoint-kodomonokuni-25-v1',
  routeId: 'kodomonokuni',
  ratio: 0.25,
  stampNumber: 1,
  title: '25% くかんスタンプ',
  description: 'テスト',
  condition: { kind: 'route-effort', routeId: 'kodomonokuni', ratio: 0.25 },
}

describe('マイルストーン履歴', () => {
  it('達成日を子ども向けの日本時間で表示する', () => {
    expect(formatMilestoneDate('2026-09-05T08:30:00.000Z')).toBe('2026ねん 9がつ5か')
    expect(formatMilestoneDate('2026-09-14T18:00:00.000Z')).toBe('2026ねん 9がつ15にち')
  })

  it('スタンプと路線クリアを同じ達成日時で記録する', () => {
    const events = milestoneEventsForPracticeResult(
      [{ routeId: 'kodomonokuni', level: 'complete' }],
      [checkpoint.id],
      new Map([[checkpoint.id, checkpoint]]),
      achievedAt,
    )
    expect(events).toEqual([
      { id: checkpoint.id, kind: 'route-stamp', routeId: 'kodomonokuni', ratio: 0.25, achievedAt },
      { id: 'route-achievement-kodomonokuni-complete-v1', kind: 'route-complete', routeId: 'kodomonokuni', achievedAt },
    ])
  })

  it('同じマイルストーンを二重に追加しない', () => {
    const event = milestoneEventsForPracticeResult([], [checkpoint.id], new Map([[checkpoint.id, checkpoint]]), achievedAt)[0]
    expect(appendMilestoneHistory([event], [event])).toEqual([event])
  })

  it('既存の路線クリアを駅の保存日から復元する', () => {
    const stations: Station[] = [
      { id: 'one', displayName: '一', reading: 'あ', builtIn: true },
      { id: 'two', displayName: '二', reading: 'い', builtIn: true },
    ]
    const first = completePosition(freshProgress('あ'), 0)
    const second = completePosition(freshProgress('い'), 0)
    const progress: Record<string, PracticeProgress> = {
      one: { ...first, addedAt: '2026-09-04T03:00:00.000Z' },
      two: { ...second, addedAt: achievedAt },
    }
    const history = recoverRouteAchievementHistory(
      [],
      [{ routeId: 'test-route', stationIds: ['one', 'two'] }],
      new Map(stations.map((station) => [station.id, station])),
      progress,
    )
    expect(history).toEqual([{
      id: 'route-achievement-test-route-complete-v1',
      kind: 'route-complete',
      routeId: 'test-route',
      achievedAt,
      recovered: true,
    }])
  })

  it('お手本なし完了済みならクリアとマスターの過去履歴を復元する', () => {
    const station: Station = { id: 'one', displayName: '一', reading: 'あ', builtIn: true }
    const completed = completeFreeWrittenPosition(freshProgress('あ'), 0)
    const history = recoverRouteAchievementHistory(
      [],
      [{ routeId: 'test-route', stationIds: ['one'] }],
      new Map([[station.id, station]]),
      { one: { ...completed, addedAt: achievedAt } },
    )
    expect(history.map((event) => event.kind)).toEqual(['route-complete', 'route-master'])
    expect(history.every((event) => event.recovered)).toBe(true)
  })

  it('保存日時のない旧進捗へ日付を捏造しない', () => {
    const station: Station = { id: 'one', displayName: '一', reading: 'あ', builtIn: true }
    expect(recoverRouteAchievementHistory(
      [],
      [{ routeId: 'test-route', stationIds: ['one'] }],
      new Map([[station.id, station]]),
      { one: { ...completePosition(freshProgress('あ'), 0), addedAt: undefined } },
    )).toEqual([])
  })
})
