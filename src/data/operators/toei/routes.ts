import { campaignRouteUnlockMilestoneId, TOEI_SUBWAY_CHOICE_ROUTE_IDS } from '../../../config/unlockCampaigns.ts'
import { defineRoute, nationwideRailwayId, numberedStops } from '../../railwayCatalogTypes.ts'

const tokyo = (slug: string) => nationwideRailwayId.station('13', slug)
const chiba = (slug: string) => nationwideRailwayId.station('12', slug)
const unlockId = (routeId: string) => campaignRouteUnlockMilestoneId('toei-subway-v1', routeId)

const asakusaId = 'jp.route.toei.asakusa'
const mitaId = 'jp.route.toei.mita'
const shinjukuId = 'jp.route.toei.shinjuku'
const oedoId = 'jp.route.toei.oedo'

export const toeiRoutes = [
  defineRoute({
    id: asakusaId,
    operatorId: 'jp.operator.toei',
    name: 'あさくさせん',
    color: '#e85298',
    segmentLabel: 'にしまごめ 〜 おしあげ（20えき）',
    stops: numberedStops([
      tokyo('nishi-magome'), tokyo('magome'), 'tokyu-om04', tokyo('togoshi'), 'tokyu-ik01',
      tokyo('takanawadai'), tokyo('sengakuji'), tokyo('mita'), tokyo('daimon'), 'tokyometro-shimbashi',
      'tokyometro-higashi-ginza', tokyo('takaracho'), 'tokyometro-nihombashi', 'tokyometro-ningyocho',
      tokyo('higashi-nihombashi'), tokyo('asakusabashi'), tokyo('kuramae'), 'tokyometro-asakusa',
      tokyo('honjo-azumabashi'), 'tokyometro-oshiage',
    ], 'A'),
    sourceUrl: 'https://www.kotsu.metro.tokyo.jp/subway/asakusa/',
  }),
  defineRoute({
    id: mitaId,
    operatorId: 'jp.operator.toei',
    name: 'みたせん',
    color: '#0079c2',
    segmentLabel: 'めぐろ 〜 にしたかしまだいら（27えき）',
    stops: numberedStops([
      'tokyu-mg01', 'tokyometro-shirokanedai', 'tokyometro-shirokane-takanawa', tokyo('mita'),
      tokyo('shibakoen'), tokyo('onarimon'), tokyo('uchisaiwaicho'), 'tokyometro-hibiya',
      'tokyometro-otemachi', 'tokyometro-jimbocho', tokyo('suidobashi'), tokyo('kasuga'), tokyo('hakusan'),
      tokyo('sengoku'), tokyo('sugamo'), tokyo('nishi-sugamo'), tokyo('shin-itabashi'),
      tokyo('itabashikuyakushomae'), tokyo('itabashihoncho'), tokyo('motohasunuma'), tokyo('shimura-sakaue'),
      tokyo('shimura-sanchome'), tokyo('hasune'), tokyo('nishidai'), tokyo('takashimadaira'),
      tokyo('shin-takashimadaira'), tokyo('nishi-takashimadaira'),
    ], 'I'),
    sourceUrl: 'https://www.kotsu.metro.tokyo.jp/subway/mita/',
    unlockMilestoneId: unlockId(mitaId),
  }),
  defineRoute({
    id: shinjukuId,
    operatorId: 'jp.operator.toei',
    name: 'しんじゅくせん',
    color: '#6cbb5a',
    segmentLabel: 'しんじゅく 〜 もとやわた（21えき）',
    stops: numberedStops([
      'tokyometro-shinjuku', 'tokyometro-shinjuku-sanchome', tokyo('akebonobashi'), 'tokyometro-ichigaya',
      'tokyometro-kudanshita', 'tokyometro-jimbocho', tokyo('ogawamachi'), tokyo('iwamotocho'),
      tokyo('bakuroyokoyama'), tokyo('hamacho'), tokyo('morishita'), tokyo('kikukawa'), 'tokyometro-sumiyoshi',
      tokyo('nishi-ojima'), tokyo('ojima'), tokyo('higashi-ojima'), tokyo('funabori'), tokyo('ichinoe'),
      tokyo('mizue'), tokyo('shinozaki'), chiba('motoyawata'),
    ], 'S'),
    sourceUrl: 'https://www.kotsu.metro.tokyo.jp/subway/shinjuku/',
    unlockMilestoneId: unlockId(shinjukuId),
  }),
  defineRoute({
    id: oedoId,
    operatorId: 'jp.operator.toei',
    name: 'おおえどせん',
    color: '#b6007a',
    segmentLabel: 'しんじゅくにしぐち 〜 ひかりがおか（38えき）',
    stops: numberedStops([
      tokyo('shinjuku-nishiguchi'), 'tokyometro-higashi-shinjuku', tokyo('wakamatsu-kawada'),
      tokyo('ushigome-yanagicho'), tokyo('ushigome-kagurazaka'), 'tokyometro-iidabashi', tokyo('kasuga'),
      'tokyometro-hongo-sanchome', tokyo('ueno-okachimachi'), tokyo('shin-okachimachi'), tokyo('kuramae'),
      tokyo('ryogoku'), tokyo('morishita'), 'tokyometro-kiyosumi-shirakawa', 'tokyometro-monzen-nakacho',
      'tokyometro-tsukishima', tokyo('kachidoki'), tokyo('tsukijishijo'), tokyo('shiodome'), tokyo('daimon'),
      tokyo('akabanebashi'), 'tokyometro-azabu-juban', 'tokyometro-roppongi', 'tokyometro-aoyama-itchome',
      tokyo('kokuritsu-kyogijo'), tokyo('yoyogi'), 'tokyometro-shinjuku', tokyo('tochomae'),
      tokyo('nishi-shinjuku-gochome'), 'tokyometro-nakano-sakaue', tokyo('higashi-nakano'), tokyo('nakai'),
      tokyo('ochiai-minami-nagasaki'), tokyo('shin-egota'), tokyo('nerima'), tokyo('toshimaen'),
      tokyo('nerima-kasugacho'), tokyo('hikarigaoka'),
    ], 'E'),
    sourceUrl: 'https://www.kotsu.metro.tokyo.jp/subway/oedo/',
    note: 'おおえどせんは とちょうまえを ちゅうしんに わのように はしります。このろせんずでは えきばんごうじゅんに ひとつのならびで ひょうじします。',
    unlockMilestoneId: unlockId(oedoId),
  }),
]

if (!TOEI_SUBWAY_CHOICE_ROUTE_IDS.every((routeId) => toeiRoutes.some((route) => route.id === routeId))) {
  throw new Error('都営地下鉄の選択解除路線が路線データと一致しません')
}
