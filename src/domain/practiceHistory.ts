import type { PracticeHistoryEvent, PracticeMode, Station } from './types'

const MAX_PRACTICE_HISTORY = 5000

export interface DailyPracticeSummary {
  date: string
  stationCount: number
  stations: Array<{ id: string; name: string }>
  characterCount: number
  kanaCounts: Array<{ kana: string; count: number }>
  freeWrittenCount: number
}

export function createPracticeHistoryEvent(
  station: Station,
  kana: string,
  position: number,
  mode: PracticeMode,
  freeWritten: boolean,
  practicedAt = new Date().toISOString(),
): PracticeHistoryEvent {
  const nonce = Math.random().toString(36).slice(2, 10)
  return {
    id: `practice-${practicedAt}-${station.id}-${position}-${nonce}`,
    practicedAt,
    stationId: station.id,
    stationName: station.displayName,
    kana,
    position,
    mode,
    freeWritten,
  }
}

export function appendPracticeHistory(
  history: PracticeHistoryEvent[],
  event: PracticeHistoryEvent,
): PracticeHistoryEvent[] {
  if (history.some((item) => item.id === event.id)) return history
  return [...history, event].slice(-MAX_PRACTICE_HISTORY)
}

function dateKey(practicedAt: string, formatter: Intl.DateTimeFormat): string {
  const parts = Object.fromEntries(formatter.formatToParts(new Date(practicedAt)).map((part) => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function dailyPracticeSummaries(
  history: PracticeHistoryEvent[],
  timeZone?: string,
): DailyPracticeSummary[] {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  })
  const days = new Map<string, PracticeHistoryEvent[]>()
  for (const event of history) {
    const key = dateKey(event.practicedAt, formatter)
    days.set(key, [...(days.get(key) ?? []), event])
  }
  return [...days.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, events]) => {
      const stationMap = new Map<string, string>()
      const kanaMap = new Map<string, number>()
      for (const event of events) {
        stationMap.set(event.stationId, event.stationName)
        kanaMap.set(event.kana, (kanaMap.get(event.kana) ?? 0) + 1)
      }
      return {
        date,
        stationCount: stationMap.size,
        stations: [...stationMap].map(([id, name]) => ({ id, name })),
        characterCount: events.length,
        kanaCounts: [...kanaMap].map(([kana, count]) => ({ kana, count })),
        freeWrittenCount: events.filter((event) => event.freeWritten).length,
      }
    })
}
