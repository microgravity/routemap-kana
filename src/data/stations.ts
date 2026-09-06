import type { Route, Station } from '../domain/types'

const TOKYU_SOURCE = 'https://www.tokyu.co.jp/railway/map/'

export const builtInStations: Station[] = [
  { id: 'tokyu-ty05', displayName: '学芸大学', reading: 'がくげいだいがく', builtIn: true },
  { id: 'tokyu-ty06', displayName: '都立大学', reading: 'とりつだいがく', builtIn: true },
  { id: 'tokyu-ty07', displayName: '自由が丘', reading: 'じゆうがおか', builtIn: true },
  { id: 'tokyu-ty08', displayName: '田園調布', reading: 'でんえんちょうふ', builtIn: true },
  { id: 'tokyu-ty09', displayName: '多摩川', reading: 'たまがわ', builtIn: true },
  { id: 'tokyu-ty10', displayName: '新丸子', reading: 'しんまるこ', builtIn: true },
  { id: 'tokyu-ty11', displayName: '武蔵小杉', reading: 'むさしこすぎ', builtIn: true },

  { id: 'tokyu-mg01', displayName: '目黒', reading: 'めぐろ', builtIn: true },
  { id: 'tokyu-mg02', displayName: '不動前', reading: 'ふどうまえ', builtIn: true },
  { id: 'tokyu-mg03', displayName: '武蔵小山', reading: 'むさしこやま', builtIn: true },
  { id: 'tokyu-mg04', displayName: '西小山', reading: 'にしこやま', builtIn: true },
  { id: 'tokyu-mg05', displayName: '洗足', reading: 'せんぞく', builtIn: true },
  { id: 'tokyu-mg06', displayName: '大岡山', reading: 'おおおかやま', builtIn: true },
  { id: 'tokyu-mg07', displayName: '奥沢', reading: 'おくさわ', builtIn: true },

  { id: 'tokyu-ik07', displayName: '洗足池', reading: 'せんぞくいけ', builtIn: true },
  { id: 'tokyu-ik08', displayName: '石川台', reading: 'いしかわだい', builtIn: true },
  { id: 'tokyu-ik09', displayName: '雪が谷大塚', reading: 'ゆきがやおおつか', builtIn: true },
  { id: 'tokyu-ik10', displayName: '御嶽山', reading: 'おんたけさん', builtIn: true },
  { id: 'tokyu-ik11', displayName: '久が原', reading: 'くがはら', builtIn: true },
  { id: 'tokyu-ik12', displayName: '千鳥町', reading: 'ちどりちょう', builtIn: true },
  { id: 'tokyu-ik13', displayName: '池上', reading: 'いけがみ', builtIn: true },
].map((station) => ({ ...station, sourceUrl: TOKYU_SOURCE }))

export const routes: Route[] = [
  {
    id: 'toyoko',
    name: 'とうよこせん',
    color: '#db5570',
    segmentLabel: 'がくげいだいがく 〜 むさしこすぎ',
    orderedStationIds: ['tokyu-ty05', 'tokyu-ty06', 'tokyu-ty07', 'tokyu-ty08', 'tokyu-ty09', 'tokyu-ty10', 'tokyu-ty11'],
    sourceUrl: 'https://www.tokyu.co.jp/railway/ty/',
  },
  {
    id: 'meguro',
    name: 'めぐろせん',
    color: '#319c95',
    segmentLabel: 'めぐろ 〜 おくさわ',
    orderedStationIds: ['tokyu-mg01', 'tokyu-mg02', 'tokyu-mg03', 'tokyu-mg04', 'tokyu-mg05', 'tokyu-mg06', 'tokyu-mg07'],
    sourceUrl: 'https://www.tokyu.co.jp/railway/mg/',
  },
  {
    id: 'ikegami',
    name: 'いけがみせん',
    color: '#c94d91',
    segmentLabel: 'せんぞくいけ 〜 いけがみ',
    orderedStationIds: ['tokyu-ik07', 'tokyu-ik08', 'tokyu-ik09', 'tokyu-ik10', 'tokyu-ik11', 'tokyu-ik12', 'tokyu-ik13'],
    sourceUrl: 'https://www.tokyu.co.jp/railway/ik/',
  },
]

export const builtInStationById = new Map(builtInStations.map((station) => [station.id, station]))
