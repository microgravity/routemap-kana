import { completePosition, completedStationCount, freshProgress, isStationPracticed, reconcileProgress } from './progress'
import type { Station } from './types'

describe('練習進捗', () => {
  it('一文字の完了で駅を追加し、位置ごとに記録する', () => {
    const progress = completePosition(freshProgress('おお'), 1)
    expect(progress.added).toBe(true)
    expect(progress.practicedPositions).toEqual([1])
    expect(isStationPracticed(progress, 'おお')).toBe(false)
  })

  it('全位置を終えたときだけ全体完了になる', () => {
    const first = completePosition(freshProgress('おお'), 0)
    const second = completePosition(first, 1)
    expect(isStationPracticed(second, 'おお')).toBe(true)
  })

  it('読みが変わったら古い位置進捗を引き継がない', () => {
    const old = completePosition(freshProgress('えき'), 0)
    expect(reconcileProgress(old, 'えきまえ')).toEqual(freshProgress('えきまえ'))
  })

  it('路線の完了駅だけを数え、共有駅とカスタム駅にも同じ進捗を使う', () => {
    const stations = new Map<string, Station>([
      ['shared', { id: 'shared', displayName: '共有', reading: 'えき', builtIn: true }],
      ['custom', { id: 'custom', displayName: '追加', reading: 'あ', builtIn: false }],
      ['partial', { id: 'partial', displayName: '途中', reading: 'かき', builtIn: true }],
    ])
    const progress = {
      shared: completePosition(completePosition(freshProgress('えき'), 0), 1),
      custom: completePosition(freshProgress('あ'), 0),
      partial: completePosition(freshProgress('かき'), 0),
    }
    expect(completedStationCount(['shared'], stations, progress)).toBe(1)
    expect(completedStationCount(['shared', 'custom'], stations, progress)).toBe(2)
    expect(completedStationCount(['shared', 'custom', 'partial'], stations, progress)).toBe(2)
    expect(completedStationCount(['shared', 'shared'], stations, progress)).toBe(1)
  })
})
