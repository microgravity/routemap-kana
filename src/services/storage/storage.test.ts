import { defaultState, parseBackup, serializeBackup } from './storage'

describe('バックアップ検証', () => {
  it('正しい状態を往復できる', () => {
    const state = defaultState()
    expect(parseBackup(serializeBackup(state))).toEqual(state)
  })

  it('不正JSONと未知のバージョンを拒否する', () => {
    expect(() => parseBackup('{')).toThrow()
    expect(() => parseBackup(JSON.stringify({ ...defaultState(), schemaVersion: 99 }))).toThrow(/バージョン/)
  })

  it('存在しない駅の進捗を拒否する', () => {
    const state = defaultState()
    state.progress.unknown = {
      readingSnapshot: 'えき',
      practicedPositions: [],
      currentPosition: 0,
      added: false,
    }
    expect(() => parseBackup(serializeBackup(state))).toThrow(/みつかりません/)
  })
})
