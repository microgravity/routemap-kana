import { appendPracticeHistory, dailyPracticeSummaries } from './practiceHistory'
import type { PracticeHistoryEvent } from './types'

function event(id: string, practicedAt: string, stationId: string, stationName: string, kana: string, freeWritten = false): PracticeHistoryEvent {
  return { id, practicedAt, stationId, stationName, kana, position: 0, mode: freeWritten ? 'free' : 'trace', freeWritten }
}

describe('日別の練習記録', () => {
  it('日ごとに駅を重複せず、書いた文字を回数つきで集計する', () => {
    const summaries = dailyPracticeSummaries([
      event('1', '2026-09-12T14:50:00.000Z', 'a', '渋谷', 'し'),
      event('2', '2026-09-12T15:10:00.000Z', 'a', '渋谷', 'ぶ'),
      event('3', '2026-09-12T15:20:00.000Z', 'b', '代官山', 'し', true),
    ], 'Asia/Tokyo')

    expect(summaries).toEqual([
      {
        date: '2026-09-13',
        stationCount: 2,
        stations: [{ id: 'a', name: '渋谷' }, { id: 'b', name: '代官山' }],
        characterCount: 2,
        kanaCounts: [{ kana: 'ぶ', count: 1 }, { kana: 'し', count: 1 }],
        freeWrittenCount: 1,
      },
      {
        date: '2026-09-12',
        stationCount: 1,
        stations: [{ id: 'a', name: '渋谷' }],
        characterCount: 1,
        kanaCounts: [{ kana: 'し', count: 1 }],
        freeWrittenCount: 0,
      },
    ])
  })

  it('同じIDの記録を二重に追加しない', () => {
    const item = event('same', '2026-09-13T00:00:00.000Z', 'a', '渋谷', 'し')
    expect(appendPracticeHistory([item], item)).toHaveLength(1)
  })
})
