import {
  GOOGLE_ANALYTICS_MEASUREMENT_ID,
  GOOGLE_TAG_MANAGER_ID,
  GOOGLE_TAG_MANAGER_SCRIPT_ID,
  disableAnalytics,
  enableAnalytics,
  googleTagManagerScriptUrl,
} from './analytics'

afterEach(() => {
  document.getElementById(GOOGLE_TAG_MANAGER_SCRIPT_ID)?.remove()
  delete window.dataLayer
  vi.unstubAllEnvs()
})

describe('アクセス解析設定', () => {
  it('指定されたGTMコンテナへ接続する', () => {
    expect(GOOGLE_TAG_MANAGER_ID).toBe('GTM-MXG5B2NT')
    expect(GOOGLE_ANALYTICS_MEASUREMENT_ID).toBe('G-CVGD2ZHNYD')
    expect(googleTagManagerScriptUrl()).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-MXG5B2NT')
  })

  it('本番で許可された場合だけ同意設定後にGTMを読み込む', () => {
    vi.stubEnv('PROD', true)

    enableAnalytics()

    const script = document.getElementById(GOOGLE_TAG_MANAGER_SCRIPT_ID) as HTMLScriptElement | null
    expect(script?.src).toBe(googleTagManagerScriptUrl())
    expect(window.dataLayer?.slice(0, 2)).toEqual([
      ['consent', 'default', expect.objectContaining({ analytics_storage: 'denied', ad_storage: 'denied' })],
      ['consent', 'update', expect.objectContaining({ analytics_storage: 'granted', ad_storage: 'denied' })],
    ])
    expect(window.dataLayer?.at(2)).toEqual(expect.objectContaining({ event: 'gtm.js' }))
  })

  it('無効化時に同意を拒否へ更新する', () => {
    const script = document.createElement('script')
    script.id = GOOGLE_TAG_MANAGER_SCRIPT_ID
    document.head.append(script)
    window.dataLayer = []

    disableAnalytics()

    expect(document.getElementById(GOOGLE_TAG_MANAGER_SCRIPT_ID)).toBe(script)
    expect(window.dataLayer.at(-1)).toEqual([
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'denied', ad_storage: 'denied' }),
    ])
  })
})
