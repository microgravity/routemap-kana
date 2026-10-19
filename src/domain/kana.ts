const SMALL_KANA: Record<string, string> = {
  'ぁ': 'ちいさい あ',
  'ぃ': 'ちいさい い',
  'ぅ': 'ちいさい う',
  'ぇ': 'ちいさい え',
  'ぉ': 'ちいさい お',
  'っ': 'ちいさい つ',
  'ゃ': 'ちいさい や',
  'ゅ': 'ちいさい ゆ',
  'ょ': 'ちいさい よ',
  'ゎ': 'ちいさい わ',
  'ァ': 'ちいさい ア',
  'ィ': 'ちいさい イ',
  'ゥ': 'ちいさい ウ',
  'ェ': 'ちいさい エ',
  'ォ': 'ちいさい オ',
  'ッ': 'ちいさい ツ',
  'ャ': 'ちいさい ヤ',
  'ュ': 'ちいさい ユ',
  'ョ': 'ちいさい ヨ',
  'ヮ': 'ちいさい ワ',
}

export function normalizeReading(value: string): string {
  return value.normalize('NFC').replace(/[\s　]+/g, '')
}

export function splitKana(value: string): string[] {
  return Array.from(normalizeReading(value))
}

export function speechForKana(kana: string): string {
  return SMALL_KANA[kana] ?? kana
}

export function isHiraganaReading(value: string): boolean {
  const normalized = normalizeReading(value)
  return normalized.length > 0 && /^[\u3041-\u309fー]+$/u.test(normalized)
}

export function toKatakana(value: string): string {
  return Array.from(normalizeReading(value), (character) => {
    const code = character.codePointAt(0) ?? 0
    return code >= 0x3041 && code <= 0x3096 ? String.fromCodePoint(code + 0x60) : character
  }).join('').normalize('NFC')
}

export function readingForMode(reading: string, mode: 'hiragana' | 'katakana'): string {
  return mode === 'katakana' ? toKatakana(reading) : normalizeReading(reading)
}

export function isKatakanaReading(value: string): boolean {
  const normalized = normalizeReading(value)
  return normalized.length > 0 && /^[\u30a1-\u30ffー]+$/u.test(normalized)
}

export function readingVersion(reading: string): string {
  return normalizeReading(reading)
}
