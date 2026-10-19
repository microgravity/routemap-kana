import { isStationPracticed } from './progress'
import type { LearningModeId, PracticeProgress, Station } from './types'

export type PracticeLearningMode = Extract<LearningModeId, 'hiragana' | 'katakana'>

export const KATAKANA_UNLOCK_STATIONS = 10
export const KATAKANA_UNLOCK_MILESTONE_ID = 'learning-mode-katakana-unlock-v1'

export function katakanaUnlockCount(
  stations: readonly Station[],
  progress: Record<string, PracticeProgress>,
): number {
  return stations.filter((station) => station.builtIn && isStationPracticed(progress[station.id], station.reading)).length
}

export function isLearningModeUnlocked(
  mode: PracticeLearningMode,
  stations: readonly Station[],
  hiraganaProgress: Record<string, PracticeProgress>,
  unlockedMilestones: readonly string[] = [],
): boolean {
  return mode === 'hiragana'
    || unlockedMilestones.includes(KATAKANA_UNLOCK_MILESTONE_ID)
    || katakanaUnlockCount(stations, hiraganaProgress) >= KATAKANA_UNLOCK_STATIONS
}
