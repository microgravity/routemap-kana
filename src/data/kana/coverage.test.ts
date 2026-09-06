import { builtInStations } from '../stations'
import { splitKana } from '../../domain/kana'
import { hasGlyph } from '.'

describe('初期駅の画順データ', () => {
  it('全使用文字をカバーする', () => {
    const missing = [...new Set(builtInStations.flatMap((station) => splitKana(station.reading)).filter((kana) => !hasGlyph(kana)))]
    expect(missing).toEqual([])
  })

  it('濁音と小書き文字のデータがある', () => {
    expect(hasGlyph('が')).toBe(true)
    expect(hasGlyph('ょ')).toBe(true)
    expect(hasGlyph('ぱ')).toBe(true)
  })
})
