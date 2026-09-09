import type { RailwayOperator, Route, Station } from '../domain/types'
import type { RailwayDataset } from './railwayCatalogTypes'

export const SOTETSU_SOURCE = 'https://www.sotetsu.co.jp/train/stations/'
export const SOTETSU_ROUTE_COUNT = 3
export const SOTETSU_OFFICIAL_STATION_COUNT = 27

function station(id: string, displayName: string, reading: string): Station {
  return { id, displayName, reading, builtIn: true, sourceUrl: SOTETSU_SOURCE }
}

export const sotetsuStations: Station[] = [
  station('sotetsu-so02', '平沼橋', 'ひらぬまばし'),
  station('sotetsu-so03', '西横浜', 'にしよこはま'),
  station('sotetsu-so04', '天王町', 'てんのうちょう'),
  station('sotetsu-so05', '星川', 'ほしかわ'),
  station('sotetsu-so06', '和田町', 'わだまち'),
  station('sotetsu-so07', '上星川', 'かみほしかわ'),
  station('sotetsu-so08', '西谷', 'にしや'),
  station('sotetsu-so09', '鶴ケ峰', 'つるがみね'),
  station('sotetsu-so10', '二俣川', 'ふたまたがわ'),
  station('sotetsu-so11', '希望ケ丘', 'きぼうがおか'),
  station('sotetsu-so12', '三ツ境', 'みつきょう'),
  station('sotetsu-so13', '瀬谷', 'せや'),
  station('sotetsu-so14', '大和', 'やまと'),
  station('sotetsu-so15', '相模大塚', 'さがみおおつか'),
  station('sotetsu-so16', 'さがみ野', 'さがみの'),
  station('sotetsu-so17', 'かしわ台', 'かしわだい'),
  station('sotetsu-so18', '海老名', 'えびな'),
  station('sotetsu-so31', '南万騎が原', 'みなみまきがはら'),
  station('sotetsu-so32', '緑園都市', 'りょくえんとし'),
  station('sotetsu-so33', '弥生台', 'やよいだい'),
  station('sotetsu-so34', 'いずみ野', 'いずみの'),
  station('sotetsu-so35', 'いずみ中央', 'いずみちゅうおう'),
  station('sotetsu-so36', 'ゆめが丘', 'ゆめがおか'),
  station('sotetsu-so37', '湘南台', 'しょうなんだい'),
  station('sotetsu-so51', '羽沢横浜国大', 'はざわよこはまこくだい'),
]

function codes(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}`)
}

export const sotetsuRoutes: Route[] = [
  {
    id: 'sotetsu-main', operatorId: 'sotetsu', name: 'そうてつほんせん', color: '#315a7d',
    segmentLabel: 'よこはま 〜 えびな（18えき）',
    orderedStationIds: [
      'tokyu-ty21', 'sotetsu-so02', 'sotetsu-so03', 'sotetsu-so04', 'sotetsu-so05', 'sotetsu-so06',
      'sotetsu-so07', 'sotetsu-so08', 'sotetsu-so09', 'sotetsu-so10', 'sotetsu-so11', 'sotetsu-so12',
      'sotetsu-so13', 'sotetsu-so14', 'sotetsu-so15', 'sotetsu-so16', 'sotetsu-so17', 'sotetsu-so18',
    ],
    stationCodes: codes('SO', 18), sourceUrl: SOTETSU_SOURCE,
  },
  {
    id: 'sotetsu-izumino', operatorId: 'sotetsu', name: 'そうてついずみのせん', color: '#2f8c83',
    segmentLabel: 'ふたまたがわ 〜 しょうなんだい（8えき）',
    orderedStationIds: ['sotetsu-so10', 'sotetsu-so31', 'sotetsu-so32', 'sotetsu-so33', 'sotetsu-so34', 'sotetsu-so35', 'sotetsu-so36', 'sotetsu-so37'],
    stationCodes: ['SO10', 'SO31', 'SO32', 'SO33', 'SO34', 'SO35', 'SO36', 'SO37'], sourceUrl: SOTETSU_SOURCE,
  },
  {
    id: 'sotetsu-shinyokohama', operatorId: 'sotetsu', name: 'そうてつしんよこはません', color: '#7663a8',
    segmentLabel: 'にしや 〜 しんよこはま（3えき）',
    orderedStationIds: ['sotetsu-so08', 'sotetsu-so51', 'tokyu-sh01'],
    stationCodes: ['SO08', 'SO51', 'SO52'], sourceUrl: SOTETSU_SOURCE,
  },
]

export const sotetsuOperator: RailwayOperator = {
  id: 'sotetsu', name: 'そうてつ', displayName: '相模鉄道', shortName: 'そうてつ', color: '#315a7d',
  routeIds: sotetsuRoutes.map((route) => route.id), sourceUrl: SOTETSU_SOURCE,
}

export const sotetsuDataset: RailwayDataset = {
  datasetId: 'jp.dataset.sotetsu', idScheme: 'legacy-v1', operator: sotetsuOperator,
  stations: sotetsuStations, routes: sotetsuRoutes, officialStationCount: SOTETSU_OFFICIAL_STATION_COUNT,
}
