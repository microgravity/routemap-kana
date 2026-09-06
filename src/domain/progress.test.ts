import { completePosition, freshProgress, isStationPracticed, reconcileProgress } from './progress'

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
})
