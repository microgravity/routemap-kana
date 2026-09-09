import type { RailwayOperator, Route, Station } from '../domain/types'
import type { RailwayDataset } from './railwayCatalogTypes'

export const TOKYU_SOURCE = 'https://www.tokyu.co.jp/railway/station/'
export const TOKYU_ROUTE_COUNT = 9
export const TOKYU_OFFICIAL_STATION_COUNT = 99

function station(id: string, displayName: string, reading: string): Station {
  return { id, displayName, reading, builtIn: true, sourceUrl: TOKYU_SOURCE }
}

export const tokyuStations: Station[] = [
  // 公開済みIDはlocalStorageの進捗キーなので変更しない。
  station('tokyu-ty01', '渋谷', 'しぶや'),
  station('tokyu-ty02', '代官山', 'だいかんやま'),
  station('tokyu-ty03', '中目黒', 'なかめぐろ'),
  station('tokyu-ty04', '祐天寺', 'ゆうてんじ'),
  station('tokyu-ty05', '学芸大学', 'がくげいだいがく'),
  station('tokyu-ty06', '都立大学', 'とりつだいがく'),
  station('tokyu-ty07', '自由が丘', 'じゆうがおか'),
  station('tokyu-ty08', '田園調布', 'でんえんちょうふ'),
  station('tokyu-ty09', '多摩川', 'たまがわ'),
  station('tokyu-ty10', '新丸子', 'しんまるこ'),
  station('tokyu-ty11', '武蔵小杉', 'むさしこすぎ'),
  station('tokyu-ty12', '元住吉', 'もとすみよし'),
  station('tokyu-ty13', '日吉', 'ひよし'),
  station('tokyu-ty14', '綱島', 'つなしま'),
  station('tokyu-ty15', '大倉山', 'おおくらやま'),
  station('tokyu-ty16', '菊名', 'きくな'),
  station('tokyu-ty17', '妙蓮寺', 'みょうれんじ'),
  station('tokyu-ty18', '白楽', 'はくらく'),
  station('tokyu-ty19', '東白楽', 'ひがしはくらく'),
  station('tokyu-ty20', '反町', 'たんまち'),
  station('tokyu-ty21', '横浜', 'よこはま'),
  station('tokyu-mg01', '目黒', 'めぐろ'),
  station('tokyu-mg02', '不動前', 'ふどうまえ'),
  station('tokyu-mg03', '武蔵小山', 'むさしこやま'),
  station('tokyu-mg04', '西小山', 'にしこやま'),
  station('tokyu-mg05', '洗足', 'せんぞく'),
  station('tokyu-mg06', '大岡山', 'おおおかやま'),
  station('tokyu-mg07', '奥沢', 'おくさわ'),
  station('tokyu-sh02', '新綱島', 'しんつなしま'),
  station('tokyu-sh01', '新横浜', 'しんよこはま'),
  station('tokyu-dt02', '池尻大橋', 'いけじりおおはし'),
  station('tokyu-dt03', '三軒茶屋', 'さんげんぢゃや'),
  station('tokyu-dt04', '駒沢大学', 'こまざわだいがく'),
  station('tokyu-dt05', '桜新町', 'さくらしんまち'),
  station('tokyu-dt06', '用賀', 'ようが'),
  station('tokyu-dt07', '二子玉川', 'ふたこたまがわ'),
  station('tokyu-dt08', '二子新地', 'ふたこしんち'),
  station('tokyu-dt09', '高津', 'たかつ'),
  station('tokyu-dt10', '溝の口', 'みぞのくち'),
  station('tokyu-dt11', '梶が谷', 'かじがや'),
  station('tokyu-dt12', '宮崎台', 'みやざきだい'),
  station('tokyu-dt13', '宮前平', 'みやまえだいら'),
  station('tokyu-dt14', '鷺沼', 'さぎぬま'),
  station('tokyu-dt15', 'たまプラーザ', 'たまぷらーざ'),
  station('tokyu-dt16', 'あざみ野', 'あざみの'),
  station('tokyu-dt17', '江田', 'えだ'),
  station('tokyu-dt18', '市が尾', 'いちがお'),
  station('tokyu-dt19', '藤が丘', 'ふじがおか'),
  station('tokyu-dt20', '青葉台', 'あおばだい'),
  station('tokyu-dt21', '田奈', 'たな'),
  station('tokyu-dt22', '長津田', 'ながつた'),
  station('tokyu-dt23', 'つくし野', 'つくしの'),
  station('tokyu-dt24', 'すずかけ台', 'すずかけだい'),
  station('tokyu-dt25', '南町田グランベリーパーク', 'みなみまちだぐらんべりーぱーく'),
  station('tokyu-dt26', 'つきみ野', 'つきみの'),
  station('tokyu-dt27', '中央林間', 'ちゅうおうりんかん'),
  station('tokyu-om01', '大井町', 'おおいまち'),
  station('tokyu-om02', '下神明', 'しもしんめい'),
  station('tokyu-om03', '戸越公園', 'とごしこうえん'),
  station('tokyu-om04', '中延', 'なかのぶ'),
  station('tokyu-om05', '荏原町', 'えばらまち'),
  station('tokyu-ik05', '旗の台', 'はたのだい'),
  station('tokyu-om07', '北千束', 'きたせんぞく'),
  station('tokyu-om09', '緑が丘', 'みどりがおか'),
  station('tokyu-om11', '九品仏', 'くほんぶつ'),
  station('tokyu-om12', '尾山台', 'おやまだい'),
  station('tokyu-om13', '等々力', 'とどろき'),
  station('tokyu-om14', '上野毛', 'かみのげ'),
  station('tokyu-ik01', '五反田', 'ごたんだ'),
  station('tokyu-ik02', '大崎広小路', 'おおさきひろこうじ'),
  station('tokyu-ik03', '戸越銀座', 'とごしぎんざ'),
  station('tokyu-ik04', '荏原中延', 'えばらなかのぶ'),
  station('tokyu-ik06', '長原', 'ながはら'),
  station('tokyu-ik07', '洗足池', 'せんぞくいけ'),
  station('tokyu-ik08', '石川台', 'いしかわだい'),
  station('tokyu-ik09', '雪が谷大塚', 'ゆきがやおおつか'),
  station('tokyu-ik10', '御嶽山', 'おんたけさん'),
  station('tokyu-ik11', '久が原', 'くがはら'),
  station('tokyu-ik12', '千鳥町', 'ちどりちょう'),
  station('tokyu-ik13', '池上', 'いけがみ'),
  station('tokyu-ik14', '蓮沼', 'はすぬま'),
  station('tokyu-ik15', '蒲田', 'かまた'),
  station('tokyu-tm02', '沼部', 'ぬまべ'),
  station('tokyu-tm03', '鵜の木', 'うのき'),
  station('tokyu-tm04', '下丸子', 'しもまるこ'),
  station('tokyu-tm05', '武蔵新田', 'むさしにった'),
  station('tokyu-tm06', '矢口渡', 'やぐちのわたし'),
  station('tokyu-sg02', '西太子堂', 'にしたいしどう'),
  station('tokyu-sg03', '若林', 'わかばやし'),
  station('tokyu-sg04', '松陰神社前', 'しょういんじんじゃまえ'),
  station('tokyu-sg05', '世田谷', 'せたがや'),
  station('tokyu-sg06', '上町', 'かみまち'),
  station('tokyu-sg07', '宮の坂', 'みやのさか'),
  station('tokyu-sg08', '山下', 'やました'),
  station('tokyu-sg09', '松原', 'まつばら'),
  station('tokyu-sg10', '下高井戸', 'しもたかいど'),
  station('tokyu-kd02', '恩田', 'おんだ'),
  station('tokyu-kd03', 'こどもの国', 'こどものくに'),
]

function codes(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}`)
}

const toyokoIds = Array.from({ length: 21 }, (_, index) => `tokyu-ty${String(index + 1).padStart(2, '0')}`)
const meguroIds = ['tokyu-mg01', 'tokyu-mg02', 'tokyu-mg03', 'tokyu-mg04', 'tokyu-mg05', 'tokyu-mg06', 'tokyu-mg07', 'tokyu-ty08', 'tokyu-ty09', 'tokyu-ty10', 'tokyu-ty11', 'tokyu-ty12', 'tokyu-ty13']
const shinyokohamaIds = ['tokyu-ty13', 'tokyu-sh02', 'tokyu-sh01']
const denentoshiIds = ['tokyu-ty01', ...Array.from({ length: 26 }, (_, index) => `tokyu-dt${String(index + 2).padStart(2, '0')}`)]
const oimachiIds = ['tokyu-om01', 'tokyu-om02', 'tokyu-om03', 'tokyu-om04', 'tokyu-om05', 'tokyu-ik05', 'tokyu-om07', 'tokyu-mg06', 'tokyu-om09', 'tokyu-ty07', 'tokyu-om11', 'tokyu-om12', 'tokyu-om13', 'tokyu-om14', 'tokyu-dt07', 'tokyu-dt10']
const ikegamiIds = Array.from({ length: 15 }, (_, index) => `tokyu-ik${String(index + 1).padStart(2, '0')}`)
const tamagawaIds = ['tokyu-ty09', 'tokyu-tm02', 'tokyu-tm03', 'tokyu-tm04', 'tokyu-tm05', 'tokyu-tm06', 'tokyu-ik15']
const setagayaIds = ['tokyu-dt03', ...Array.from({ length: 9 }, (_, index) => `tokyu-sg${String(index + 2).padStart(2, '0')}`)]
const kodomonokuniIds = ['tokyu-dt22', 'tokyu-kd02', 'tokyu-kd03']

export const tokyuRoutes: Route[] = [
  { id: 'toyoko', operatorId: 'tokyu', name: 'とうよこせん', color: '#db5570', segmentLabel: 'しぶや 〜 よこはま（21えき）', orderedStationIds: toyokoIds, stationCodes: codes('TY', 21), sourceUrl: 'https://www.tokyu.co.jp/railway/ty/' },
  { id: 'meguro', operatorId: 'tokyu', name: 'めぐろせん', color: '#319c95', segmentLabel: 'めぐろ 〜 ひよし（13えき）', orderedStationIds: meguroIds, stationCodes: codes('MG', 13), sourceUrl: 'https://www.tokyu.co.jp/railway/mg/' },
  { id: 'shinyokohama', operatorId: 'tokyu', name: 'とうきゅうしんよこはません', color: '#7d69a8', segmentLabel: 'ひよし 〜 しんよこはま（3えき）', orderedStationIds: shinyokohamaIds, stationCodes: ['SH03', 'SH02', 'SH01'], sourceUrl: 'https://www.tokyu.co.jp/railway/sh/' },
  { id: 'denentoshi', operatorId: 'tokyu', name: 'でんえんとしせん', color: '#4d9f63', segmentLabel: 'しぶや 〜 ちゅうおうりんかん（27えき）', orderedStationIds: denentoshiIds, stationCodes: codes('DT', 27), sourceUrl: 'https://www.tokyu.co.jp/railway/dt/' },
  { id: 'oimachi', operatorId: 'tokyu', name: 'おおいまちせん', color: '#e58b42', segmentLabel: 'おおいまち 〜 みぞのくち（16えき）', orderedStationIds: oimachiIds, stationCodes: codes('OM', 16), sourceUrl: 'https://www.tokyu.co.jp/railway/om/', note: 'ふたこしんち・たかつには、おおいまちせんの いちぶの かくえきていしゃが とまります。' },
  { id: 'ikegami', operatorId: 'tokyu', name: 'いけがみせん', color: '#c94d91', segmentLabel: 'ごたんだ 〜 かまた（15えき）', orderedStationIds: ikegamiIds, stationCodes: codes('IK', 15), sourceUrl: 'https://www.tokyu.co.jp/railway/ik/' },
  { id: 'tamagawa', operatorId: 'tokyu', name: 'とうきゅうたまがわせん', color: '#ae4a78', segmentLabel: 'たまがわ 〜 かまた（7えき）', orderedStationIds: tamagawaIds, stationCodes: codes('TM', 7), sourceUrl: 'https://www.tokyu.co.jp/railway/tm/' },
  { id: 'setagaya', operatorId: 'tokyu', name: 'せたがやせん', color: '#d49b18', segmentLabel: 'さんげんぢゃや 〜 しもたかいど（10えき）', orderedStationIds: setagayaIds, stationCodes: codes('SG', 10), sourceUrl: 'https://www.tokyu.co.jp/railway/sg/' },
  { id: 'kodomonokuni', operatorId: 'tokyu', name: 'こどものくにせん', color: '#3788bd', segmentLabel: 'ながつた 〜 こどものくに（3えき）', orderedStationIds: kodomonokuniIds, stationCodes: codes('KD', 3), sourceUrl: 'https://www.tokyu.co.jp/railway/kd/' },
]

export const tokyuOperator: RailwayOperator = {
  id: 'tokyu', name: 'とうきゅうでんてつ', displayName: '東急電鉄', shortName: 'とうきゅう', color: '#b6553f',
  routeIds: tokyuRoutes.map((route) => route.id), sourceUrl: TOKYU_SOURCE,
}

export const tokyuDataset: RailwayDataset = {
  datasetId: 'jp.dataset.tokyu', idScheme: 'legacy-v1', operator: tokyuOperator,
  stations: tokyuStations, routes: tokyuRoutes, officialStationCount: TOKYU_OFFICIAL_STATION_COUNT,
}
