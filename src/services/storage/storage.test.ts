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

  it('初期版の駅IDと進捗をそのまま読み込める', () => {
    const state = defaultState()
    state.progress['tokyu-ty05'] = {
      readingSnapshot: 'がくげいだいがく',
      practicedPositions: [0, 3],
      currentPosition: 3,
      added: true,
      addedAt: '2026-09-06T00:00:00.000Z',
    }
    expect(parseBackup(serializeBackup(state)).progress['tokyu-ty05']).toEqual(state.progress['tokyu-ty05'])
  })

  it('判定設定がない旧データを「ふつう」で読み込む', () => {
    const oldState = JSON.parse(serializeBackup(defaultState()))
    delete oldState.settings.traceStrictness
    expect(parseBackup(JSON.stringify(oldState)).settings.traceStrictness).toBe('standard')
  })
})
