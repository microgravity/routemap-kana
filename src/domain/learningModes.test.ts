import { completePosition, freshProgress } from './progress'
import { isLearningModeUnlocked, katakanaUnlockCount, KATAKANA_UNLOCK_MILESTONE_ID, KATAKANA_UNLOCK_STATIONS } from './learningModes'
import type { PracticeProgress, Station } from './types'

const stations: Station[] = Array.from({ length: 11 }, (_, index) => ({
  id: `station-${index}`,
  displayName: `駅${index}`,
  reading: 'あ',
  builtIn: index < 10,
}))

describe('カタカナモードの解除', () => {
  it('組み込み駅10駅の全文字完了で解除する', () => {
    const progress: Record<string, PracticeProgress> = Object.fromEntries(
      stations.slice(0, KATAKANA_UNLOCK_STATIONS).map((station) => [station.id, completePosition(freshProgress(station.reading), 0)]),
    )
    expect(katakanaUnlockCount(stations, progress)).toBe(10)
    expect(isLearningModeUnlocked('katakana', stations, progress)).toBe(true)
  })

  it('途中駅とカスタム駅は解除数へ含めない', () => {
    const progress: Record<string, PracticeProgress> = Object.fromEntries(
      stations.slice(0, 9).map((station) => [station.id, completePosition(freshProgress(station.reading), 0)]),
    )
    progress['station-10'] = completePosition(freshProgress('あ'), 0)
    expect(katakanaUnlockCount(stations, progress)).toBe(9)
    expect(isLearningModeUnlocked('katakana', stations, progress)).toBe(false)
  })

  it('一度保存した解除IDがあれば進捗変更後も再ロックしない', () => {
    expect(isLearningModeUnlocked('katakana', stations, {}, [KATAKANA_UNLOCK_MILESTONE_ID])).toBe(true)
  })
})
