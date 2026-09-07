import type { PracticeProgress, Station } from './types'
import { readingVersion, splitKana } from './kana'

export function freshProgress(reading: string): PracticeProgress {
  return {
    readingSnapshot: readingVersion(reading),
    practicedPositions: [],
    currentPosition: 0,
    added: false,
  }
}

export function reconcileProgress(progress: PracticeProgress | undefined, reading: string): PracticeProgress {
  const version = readingVersion(reading)
  if (!progress || progress.readingSnapshot !== version) return freshProgress(reading)
  const lastIndex = Math.max(0, splitKana(reading).length - 1)
  return {
    ...progress,
    practicedPositions: [...new Set(progress.practicedPositions)].filter((index) => index >= 0 && index <= lastIndex),
    currentPosition: Math.min(Math.max(0, progress.currentPosition), lastIndex),
  }
}

export function completePosition(progress: PracticeProgress, position: number): PracticeProgress {
  return {
    ...progress,
    practicedPositions: [...new Set([...progress.practicedPositions, position])].sort((a, b) => a - b),
    currentPosition: position,
    added: true,
    addedAt: progress.addedAt ?? new Date().toISOString(),
  }
}

export function isStationPracticed(progress: PracticeProgress | undefined, reading: string): boolean {
  if (!progress) return false
  const current = reconcileProgress(progress, reading)
  const positions = splitKana(reading)
  return positions.length > 0 && positions.every((_, index) => current.practicedPositions.includes(index))
}

export function completedStationCount(
  stationIds: string[],
  stationById: ReadonlyMap<string, Station>,
  progress: Record<string, PracticeProgress>,
): number {
  return [...new Set(stationIds)].filter((stationId) => {
    const station = stationById.get(stationId)
    return Boolean(station && isStationPracticed(progress[stationId], station.reading))
  }).length
}

export function nextUnpracticedPosition(progress: PracticeProgress, reading: string, after: number): number {
  const length = splitKana(reading).length
  for (let offset = 1; offset <= length; offset += 1) {
    const index = (after + offset) % length
    if (!progress.practicedPositions.includes(index)) return index
  }
  return (after + 1) % length
}
