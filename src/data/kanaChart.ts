export const basicKanaRows: Array<Array<string | null>> = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', null, 'ゆ', null, 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', null, null, null, 'を'],
  ['ん', null, null, null, null],
]

export const voicedKanaRows: string[][] = [
  ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
  ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  ['だ', 'ぢ', 'づ', 'で', 'ど'],
  ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
]

export const smallKanaRows: string[][] = [
  ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ'],
  ['ゃ', 'ゅ', 'ょ', 'っ', 'ゎ'],
]

export const basicKatakanaRows = basicKanaRows.map((row) => row.map((kana) => kana && String.fromCodePoint(kana.codePointAt(0)! + 0x60)))
export const voicedKatakanaRows = voicedKanaRows.map((row) => row.map((kana) => String.fromCodePoint(kana.codePointAt(0)! + 0x60)))
export const smallKatakanaRows = smallKanaRows.map((row) => row.map((kana) => String.fromCodePoint(kana.codePointAt(0)! + 0x60)))
export const katakanaOtherRows: string[][] = [['ー']]
