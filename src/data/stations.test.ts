import { NORMALIZED_STATION_COUNT, OFFICIAL_ROUTE_COUNT, OFFICIAL_STATION_COUNT, builtInStationById, builtInStations, routes } from './stations'

describe('東急9路線の駅データ', () => {
  const expected = [
    ['toyoko', 21, '渋谷', '横浜'],
    ['meguro', 13, '目黒', '日吉'],
    ['shinyokohama', 3, '日吉', '新横浜'],
    ['denentoshi', 27, '渋谷', '中央林間'],
    ['oimachi', 16, '大井町', '溝の口'],
    ['ikegami', 15, '五反田', '蒲田'],
    ['tamagawa', 7, '多摩川', '蒲田'],
    ['setagaya', 10, '三軒茶屋', '下高井戸'],
    ['kodomonokuni', 3, '長津田', 'こどもの国'],
  ] as const

  const expectedOrder: Record<string, string[]> = {
    toyoko: ['渋谷', '代官山', '中目黒', '祐天寺', '学芸大学', '都立大学', '自由が丘', '田園調布', '多摩川', '新丸子', '武蔵小杉', '元住吉', '日吉', '綱島', '大倉山', '菊名', '妙蓮寺', '白楽', '東白楽', '反町', '横浜'],
    meguro: ['目黒', '不動前', '武蔵小山', '西小山', '洗足', '大岡山', '奥沢', '田園調布', '多摩川', '新丸子', '武蔵小杉', '元住吉', '日吉'],
    shinyokohama: ['日吉', '新綱島', '新横浜'],
    denentoshi: ['渋谷', '池尻大橋', '三軒茶屋', '駒沢大学', '桜新町', '用賀', '二子玉川', '二子新地', '高津', '溝の口', '梶が谷', '宮崎台', '宮前平', '鷺沼', 'たまプラーザ', 'あざみ野', '江田', '市が尾', '藤が丘', '青葉台', '田奈', '長津田', 'つくし野', 'すずかけ台', '南町田グランベリーパーク', 'つきみ野', '中央林間'],
    oimachi: ['大井町', '下神明', '戸越公園', '中延', '荏原町', '旗の台', '北千束', '大岡山', '緑が丘', '自由が丘', '九品仏', '尾山台', '等々力', '上野毛', '二子玉川', '溝の口'],
    ikegami: ['五反田', '大崎広小路', '戸越銀座', '荏原中延', '旗の台', '長原', '洗足池', '石川台', '雪が谷大塚', '御嶽山', '久が原', '千鳥町', '池上', '蓮沼', '蒲田'],
    tamagawa: ['多摩川', '沼部', '鵜の木', '下丸子', '武蔵新田', '矢口渡', '蒲田'],
    setagaya: ['三軒茶屋', '西太子堂', '若林', '松陰神社前', '世田谷', '上町', '宮の坂', '山下', '松原', '下高井戸'],
    kodomonokuni: ['長津田', '恩田', 'こどもの国'],
  }

  it('公式9路線・99駅を、共有駅を統合した98 Station IDで収録する', () => {
    expect(OFFICIAL_ROUTE_COUNT).toBe(9)
    expect(OFFICIAL_STATION_COUNT).toBe(99)
    expect(routes).toHaveLength(OFFICIAL_ROUTE_COUNT)
    expect(builtInStations).toHaveLength(NORMALIZED_STATION_COUNT)
    expect(new Set(builtInStations.map((station) => station.id)).size).toBe(NORMALIZED_STATION_COUNT)
    expect(routes.reduce((count, route) => count + route.orderedStationIds.length, 0)).toBe(115)
  })

  it.each(expected)('%sの駅数・起点・終点・駅番号を保つ', (routeId, count, first, last) => {
    const route = routes.find((item) => item.id === routeId)!
    expect(route.orderedStationIds).toHaveLength(count)
    expect(route.stationCodes).toHaveLength(count)
    expect(builtInStationById.get(route.orderedStationIds[0])?.displayName).toBe(first)
    expect(builtInStationById.get(route.orderedStationIds.at(-1)!)?.displayName).toBe(last)
    expect(route.orderedStationIds.map((id) => builtInStationById.get(id)?.displayName)).toEqual(expectedOrder[routeId])
    expect(route.orderedStationIds.every((id) => builtInStationById.has(id))).toBe(true)
  })

  it('各路線の駅番号を起点から終点まで保持する', () => {
    for (const route of routes) {
      const expectedCodes = route.id === 'shinyokohama'
        ? ['SH03', 'SH02', 'SH01']
        : Array.from({ length: route.stationCodes.length }, (_, index) => {
          const prefix = route.stationCodes[0].slice(0, 2)
          return `${prefix}${String(index + 1).padStart(2, '0')}`
        })
      expect(route.stationCodes).toEqual(expectedCodes)
    }
  })

  it('共有駅で同じStation IDを使う', () => {
    const ids = Object.fromEntries(routes.map((route) => [route.id, new Set(route.orderedStationIds)]))
    expect(ids.toyoko.has('tokyu-ty07') && ids.oimachi.has('tokyu-ty07')).toBe(true)
    expect(ids.toyoko.has('tokyu-ty13') && ids.meguro.has('tokyu-ty13') && ids.shinyokohama.has('tokyu-ty13')).toBe(true)
    expect(ids.denentoshi.has('tokyu-dt03') && ids.setagaya.has('tokyu-dt03')).toBe(true)
    expect(ids.denentoshi.has('tokyu-dt22') && ids.kodomonokuni.has('tokyu-dt22')).toBe(true)
  })

  it('既存駅IDを変更しない', () => {
    const preserved = ['tokyu-ty05', 'tokyu-ty06', 'tokyu-ty07', 'tokyu-ty08', 'tokyu-ty09', 'tokyu-ty10', 'tokyu-ty11', 'tokyu-mg01', 'tokyu-mg06', 'tokyu-mg07', 'tokyu-ik07', 'tokyu-ik13']
    expect(preserved.every((id) => builtInStationById.has(id))).toBe(true)
  })

  it('二子新地・高津は田園都市線駅として保持し大井町線注記で扱う', () => {
    const oimachi = routes.find((route) => route.id === 'oimachi')!
    expect(oimachi.orderedStationIds).not.toContain('tokyu-dt08')
    expect(oimachi.orderedStationIds).not.toContain('tokyu-dt09')
    expect(oimachi.note).toContain('ふたこしんち・たかつ')
  })
})
