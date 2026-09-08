import {
  NORMALIZED_STATION_COUNT,
  OFFICIAL_ROUTE_COUNT,
  OFFICIAL_STATION_COUNT,
  SOTETSU_OFFICIAL_STATION_COUNT,
  SOTETSU_ROUTE_COUNT,
  TOKYU_OFFICIAL_STATION_COUNT,
  TOKYU_ROUTE_COUNT,
  builtInStationById,
  builtInStations,
  railwayOperators,
  routes,
} from './stations'

const expectedRoutes = [
  ['toyoko', 'tokyu', 21, '渋谷', '横浜', 'TY01', 'TY21'],
  ['meguro', 'tokyu', 13, '目黒', '日吉', 'MG01', 'MG13'],
  ['shinyokohama', 'tokyu', 3, '日吉', '新横浜', 'SH03', 'SH01'],
  ['denentoshi', 'tokyu', 27, '渋谷', '中央林間', 'DT01', 'DT27'],
  ['oimachi', 'tokyu', 16, '大井町', '溝の口', 'OM01', 'OM16'],
  ['ikegami', 'tokyu', 15, '五反田', '蒲田', 'IK01', 'IK15'],
  ['tamagawa', 'tokyu', 7, '多摩川', '蒲田', 'TM01', 'TM07'],
  ['setagaya', 'tokyu', 10, '三軒茶屋', '下高井戸', 'SG01', 'SG10'],
  ['kodomonokuni', 'tokyu', 3, '長津田', 'こどもの国', 'KD01', 'KD03'],
  ['sotetsu-main', 'sotetsu', 18, '横浜', '海老名', 'SO01', 'SO18'],
  ['sotetsu-izumino', 'sotetsu', 8, '二俣川', '湘南台', 'SO10', 'SO37'],
  ['sotetsu-shinyokohama', 'sotetsu', 3, '西谷', '新横浜', 'SO08', 'SO52'],
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
  'sotetsu-main': ['横浜', '平沼橋', '西横浜', '天王町', '星川', '和田町', '上星川', '西谷', '鶴ケ峰', '二俣川', '希望ケ丘', '三ツ境', '瀬谷', '大和', '相模大塚', 'さがみ野', 'かしわ台', '海老名'],
  'sotetsu-izumino': ['二俣川', '南万騎が原', '緑園都市', '弥生台', 'いずみ野', 'いずみ中央', 'ゆめが丘', '湘南台'],
  'sotetsu-shinyokohama': ['西谷', '羽沢横浜国大', '新横浜'],
}

describe('鉄道会社・路線・駅データ', () => {
  it('東急9路線と相鉄3路線を会社別に収録する', () => {
    expect(TOKYU_ROUTE_COUNT).toBe(9)
    expect(SOTETSU_ROUTE_COUNT).toBe(3)
    expect(TOKYU_OFFICIAL_STATION_COUNT).toBe(99)
    expect(SOTETSU_OFFICIAL_STATION_COUNT).toBe(27)
    expect(OFFICIAL_ROUTE_COUNT).toBe(12)
    expect(OFFICIAL_STATION_COUNT).toBe(126)
    expect(routes).toHaveLength(OFFICIAL_ROUTE_COUNT)
    expect(railwayOperators.map((operator) => [operator.id, operator.routeIds])).toEqual([
      ['tokyu', ['toyoko', 'meguro', 'shinyokohama', 'denentoshi', 'oimachi', 'ikegami', 'tamagawa', 'setagaya', 'kodomonokuni']],
      ['sotetsu', ['sotetsu-main', 'sotetsu-izumino', 'sotetsu-shinyokohama']],
    ])
  })

  it('会社間の共有駅を統合した123 Station IDで収録する', () => {
    expect(builtInStations).toHaveLength(NORMALIZED_STATION_COUNT)
    expect(new Set(builtInStations.map((station) => station.id)).size).toBe(NORMALIZED_STATION_COUNT)
    expect(routes.reduce((count, route) => count + route.orderedStationIds.length, 0)).toBe(144)
  })

  it.each(expectedRoutes)('%sの会社・駅数・起点・終点・駅番号・駅順を保つ', (routeId, operatorId, count, first, last, firstCode, lastCode) => {
    const route = routes.find((item) => item.id === routeId)!
    expect(route.operatorId).toBe(operatorId)
    expect(route.orderedStationIds).toHaveLength(count)
    expect(route.stationCodes).toHaveLength(count)
    expect(route.stationCodes[0]).toBe(firstCode)
    expect(route.stationCodes.at(-1)).toBe(lastCode)
    expect(builtInStationById.get(route.orderedStationIds[0])?.displayName).toBe(first)
    expect(builtInStationById.get(route.orderedStationIds.at(-1)!)?.displayName).toBe(last)
    expect(route.orderedStationIds.map((id) => builtInStationById.get(id)?.displayName)).toEqual(expectedOrder[routeId])
    expect(route.orderedStationIds.every((id) => builtInStationById.has(id))).toBe(true)
  })

  it('全路線の駅番号を起点から終点まで保持する', () => {
    const specialCodes: Record<string, string[]> = {
      shinyokohama: ['SH03', 'SH02', 'SH01'],
      'sotetsu-izumino': ['SO10', 'SO31', 'SO32', 'SO33', 'SO34', 'SO35', 'SO36', 'SO37'],
      'sotetsu-shinyokohama': ['SO08', 'SO51', 'SO52'],
    }
    for (const route of routes) {
      const expectedCodes = specialCodes[route.id] ?? Array.from(
        { length: route.stationCodes.length },
        (_, index) => `${route.stationCodes[0].slice(0, 2)}${String(index + 1).padStart(2, '0')}`,
      )
      expect(route.stationCodes).toEqual(expectedCodes)
    }
  })

  it('共有駅で同じStation IDを使う', () => {
    const ids = Object.fromEntries(routes.map((route) => [route.id, new Set(route.orderedStationIds)]))
    expect(ids.toyoko.has('tokyu-ty07') && ids.oimachi.has('tokyu-ty07')).toBe(true)
    expect(ids.toyoko.has('tokyu-ty13') && ids.meguro.has('tokyu-ty13') && ids.shinyokohama.has('tokyu-ty13')).toBe(true)
    expect(ids.denentoshi.has('tokyu-dt03') && ids.setagaya.has('tokyu-dt03')).toBe(true)
    expect(ids.denentoshi.has('tokyu-dt22') && ids.kodomonokuni.has('tokyu-dt22')).toBe(true)
    expect(ids.toyoko.has('tokyu-ty21') && ids['sotetsu-main'].has('tokyu-ty21')).toBe(true)
    expect(ids.shinyokohama.has('tokyu-sh01') && ids['sotetsu-shinyokohama'].has('tokyu-sh01')).toBe(true)
    expect(ids['sotetsu-main'].has('sotetsu-so08') && ids['sotetsu-shinyokohama'].has('sotetsu-so08')).toBe(true)
    expect(ids['sotetsu-main'].has('sotetsu-so10') && ids['sotetsu-izumino'].has('sotetsu-so10')).toBe(true)
  })

  it('既存駅IDを変更しない', () => {
    const preserved = ['tokyu-ty05', 'tokyu-ty06', 'tokyu-ty07', 'tokyu-ty08', 'tokyu-ty09', 'tokyu-ty10', 'tokyu-ty11', 'tokyu-mg01', 'tokyu-mg06', 'tokyu-mg07', 'tokyu-ik07', 'tokyu-ik13']
    expect(preserved.every((id) => builtInStationById.has(id))).toBe(true)
  })

  it('相鉄の公式表記とひらがなの読みを保持する', () => {
    expect(builtInStationById.get('sotetsu-so09')).toMatchObject({ displayName: '鶴ケ峰', reading: 'つるがみね' })
    expect(builtInStationById.get('sotetsu-so11')).toMatchObject({ displayName: '希望ケ丘', reading: 'きぼうがおか' })
    expect(builtInStationById.get('sotetsu-so51')).toMatchObject({ displayName: '羽沢横浜国大', reading: 'はざわよこはまこくだい' })
  })

  it('二子新地・高津は田園都市線駅として保持し大井町線注記で扱う', () => {
    const oimachi = routes.find((route) => route.id === 'oimachi')!
    expect(oimachi.orderedStationIds).not.toContain('tokyu-dt08')
    expect(oimachi.orderedStationIds).not.toContain('tokyu-dt09')
    expect(oimachi.note).toContain('ふたこしんち・たかつ')
  })
})
