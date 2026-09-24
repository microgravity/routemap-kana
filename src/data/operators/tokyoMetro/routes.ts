import { campaignRouteUnlockMilestoneId } from '../../../config/unlockCampaigns.ts'
import { defineRoute, numberedStops, type RouteStop } from '../../railwayCatalogTypes.ts'

function metroRouteUnlockMilestoneId(routeId: string): string {
  return campaignRouteUnlockMilestoneId('tokyo-metro-v1', routeId)
}

function codedStops(stationIds: readonly string[], codes: readonly string[]): RouteStop[] {
  if (stationIds.length !== codes.length) throw new Error('駅IDと駅番号の件数が一致しません')
  return stationIds.map((stationId, index) => ({ stationId, code: codes[index] }))
}

export const tokyoMetroRoutes = [
  defineRoute({
    id: 'metro-ginza', operatorId: 'tokyo-metro', name: 'ぎんざせん', color: '#f39700',
    segmentLabel: 'しぶや 〜 あさくさ（19えき）',
    stops: numberedStops(['tokyu-ty01', 'tokyometro-omote-sando', 'tokyometro-gaiemmae', 'tokyometro-aoyama-itchome', 'tokyometro-akasaka-mitsuke', 'tokyometro-tameike-sanno', 'tokyometro-toranomon', 'tokyometro-shimbashi', 'tokyometro-ginza', 'tokyometro-kyobashi', 'tokyometro-nihombashi', 'tokyometro-mitsukoshimae', 'tokyometro-kanda', 'tokyometro-suehirocho', 'tokyometro-ueno-hirokoji', 'tokyometro-ueno', 'tokyometro-inaricho', 'tokyometro-tawaramachi', 'tokyometro-asakusa'], 'G'),
    sourceUrl: 'https://www.tokyometro.jp/station/line_ginza/index.html',
  }),
  defineRoute({
    id: 'metro-marunouchi', operatorId: 'tokyo-metro', name: 'まるのうちせん', color: '#e60012',
    unlockMilestoneId: metroRouteUnlockMilestoneId('metro-marunouchi'),
    segmentLabel: 'おぎくぼ・ほうなんちょう 〜 いけぶくろ（28えき）',
    stops: codedStops(
      ['tokyometro-ogikubo', 'tokyometro-minami-asagaya', 'tokyometro-shin-koenji', 'tokyometro-higashi-koenji', 'tokyometro-shin-nakano', 'tokyometro-honancho', 'tokyometro-nakano-fujimicho', 'tokyometro-nakano-shimbashi', 'tokyometro-nakano-sakaue', 'tokyometro-nishi-shinjuku', 'tokyometro-shinjuku', 'tokyometro-shinjuku-sanchome', 'tokyometro-shinjuku-gyoemmae', 'tokyometro-yotsuya-sanchome', 'tokyometro-yotsuya', 'tokyometro-akasaka-mitsuke', 'tokyometro-kokkai-gijidomae', 'tokyometro-kasumigaseki', 'tokyometro-ginza', 'tokyometro-tokyo', 'tokyometro-otemachi', 'tokyometro-awajicho', 'tokyometro-ochanomizu', 'tokyometro-hongo-sanchome', 'tokyometro-korakuen', 'tokyometro-myogadani', 'tokyometro-shin-otsuka', 'tokyometro-ikebukuro'],
      ['M01', 'M02', 'M03', 'M04', 'M05', 'm03', 'm04', 'm05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25'],
    ),
    sourceUrl: 'https://www.tokyometro.jp/station/line_marunouchi/index.html',
    note: 'なかのさかうえで ほうなんちょうほうめんへ えだわかれします。このろせんずでは ぜんえきを ひとつのならびで ひょうじします。',
  }),
  defineRoute({
    id: 'metro-hibiya', operatorId: 'tokyo-metro', name: 'ひびやせん', color: '#9caeb7',
    unlockMilestoneId: metroRouteUnlockMilestoneId('metro-hibiya'),
    segmentLabel: 'なかめぐろ 〜 きたせんじゅ（22えき）',
    stops: numberedStops(['tokyu-ty03', 'tokyometro-ebisu', 'tokyometro-hiro-o', 'tokyometro-roppongi', 'tokyometro-kamiyacho', 'tokyometro-toranomon-hills', 'tokyometro-kasumigaseki', 'tokyometro-hibiya', 'tokyometro-ginza', 'tokyometro-higashi-ginza', 'tokyometro-tsukiji', 'tokyometro-hatchobori', 'tokyometro-kayabacho', 'tokyometro-ningyocho', 'tokyometro-kodemmacho', 'tokyometro-akihabara', 'tokyometro-naka-okachimachi', 'tokyometro-ueno', 'tokyometro-iriya', 'tokyometro-minowa', 'tokyometro-minami-senju', 'tokyometro-kita-senju'], 'H'),
    sourceUrl: 'https://www.tokyometro.jp/station/line_hibiya/index.html',
  }),
  defineRoute({
    id: 'metro-tozai', operatorId: 'tokyo-metro', name: 'とうざいせん', color: '#00a7db',
    unlockMilestoneId: metroRouteUnlockMilestoneId('metro-tozai'),
    segmentLabel: 'なかの 〜 にしふなばし（23えき）',
    stops: numberedStops(['tokyometro-nakano', 'tokyometro-ochiai', 'tokyometro-takadanobaba', 'tokyometro-waseda', 'tokyometro-kagurazaka', 'tokyometro-iidabashi', 'tokyometro-kudanshita', 'tokyometro-takebashi', 'tokyometro-otemachi', 'tokyometro-nihombashi', 'tokyometro-kayabacho', 'tokyometro-monzen-nakacho', 'tokyometro-kiba', 'tokyometro-toyocho', 'tokyometro-minami-sunamachi', 'tokyometro-nishi-kasai', 'tokyometro-kasai', 'tokyometro-urayasu', 'tokyometro-minami-gyotoku', 'tokyometro-gyotoku', 'tokyometro-myoden', 'tokyometro-baraki-nakayama', 'tokyometro-nishi-funabashi'], 'T'),
    sourceUrl: 'https://www.tokyometro.jp/station/line_tozai/index.html',
  }),
  defineRoute({
    id: 'metro-chiyoda', operatorId: 'tokyo-metro', name: 'ちよだせん', color: '#009944',
    unlockMilestoneId: metroRouteUnlockMilestoneId('metro-chiyoda'),
    segmentLabel: 'よよぎうえはら 〜 きたあやせ（20えき）',
    stops: numberedStops(['tokyometro-yoyogi-uehara', 'tokyometro-yoyogi-koen', 'tokyometro-meiji-jingumae', 'tokyometro-omote-sando', 'tokyometro-nogizaka', 'tokyometro-akasaka', 'tokyometro-kokkai-gijidomae', 'tokyometro-kasumigaseki', 'tokyometro-hibiya', 'tokyometro-nijubashimae', 'tokyometro-otemachi', 'tokyometro-shin-ochanomizu', 'tokyometro-yushima', 'tokyometro-nezu', 'tokyometro-sendagi', 'tokyometro-nishi-nippori', 'tokyometro-machiya', 'tokyometro-kita-senju', 'tokyometro-ayase', 'tokyometro-kita-ayase'], 'C'),
    sourceUrl: 'https://www.tokyometro.jp/station/line_chiyoda/index.html',
  }),
  defineRoute({
    id: 'metro-yurakucho', operatorId: 'tokyo-metro', name: 'ゆうらくちょうせん', color: '#c1a470',
    unlockMilestoneId: metroRouteUnlockMilestoneId('metro-yurakucho'),
    segmentLabel: 'わこうし 〜 しんきば（24えき）',
    stops: numberedStops(['tokyometro-wakoshi', 'tokyometro-chikatetsu-narimasu', 'tokyometro-chikatetsu-akatsuka', 'tokyometro-heiwadai', 'tokyometro-hikawadai', 'tokyometro-kotake-mukaihara', 'tokyometro-senkawa', 'tokyometro-kanamecho', 'tokyometro-ikebukuro', 'tokyometro-higashi-ikebukuro', 'tokyometro-gokokuji', 'tokyometro-edogawabashi', 'tokyometro-iidabashi', 'tokyometro-ichigaya', 'tokyometro-kojimachi', 'tokyometro-nagatacho', 'tokyometro-sakuradamon', 'tokyometro-yurakucho', 'tokyometro-ginza-itchome', 'tokyometro-shintomicho', 'tokyometro-tsukishima', 'tokyometro-toyosu', 'tokyometro-tatsumi', 'tokyometro-shin-kiba'], 'Y'),
    sourceUrl: 'https://www.tokyometro.jp/station/line_yurakucho/index.html',
  }),
  defineRoute({
    id: 'metro-hanzomon', operatorId: 'tokyo-metro', name: 'はんぞうもんせん', color: '#9b7cb6',
    segmentLabel: 'しぶや 〜 おしあげ（14えき）',
    stops: numberedStops(['tokyu-ty01', 'tokyometro-omote-sando', 'tokyometro-aoyama-itchome', 'tokyometro-nagatacho', 'tokyometro-hanzomon', 'tokyometro-kudanshita', 'tokyometro-jimbocho', 'tokyometro-otemachi', 'tokyometro-mitsukoshimae', 'tokyometro-suitengumae', 'tokyometro-kiyosumi-shirakawa', 'tokyometro-sumiyoshi', 'tokyometro-kinshicho', 'tokyometro-oshiage'], 'Z'),
    sourceUrl: 'https://www.tokyometro.jp/station/line_hanzomon/index.html',
  }),
  defineRoute({
    id: 'metro-namboku', operatorId: 'tokyo-metro', name: 'なんぼくせん', color: '#00ada9',
    unlockMilestoneId: metroRouteUnlockMilestoneId('metro-namboku'),
    segmentLabel: 'めぐろ 〜 あかばねいわぶち（19えき）',
    stops: numberedStops(['tokyu-mg01', 'tokyometro-shirokanedai', 'tokyometro-shirokane-takanawa', 'tokyometro-azabu-juban', 'tokyometro-roppongi-itchome', 'tokyometro-tameike-sanno', 'tokyometro-nagatacho', 'tokyometro-yotsuya', 'tokyometro-ichigaya', 'tokyometro-iidabashi', 'tokyometro-korakuen', 'tokyometro-todaimae', 'tokyometro-hon-komagome', 'tokyometro-komagome', 'tokyometro-nishigahara', 'tokyometro-oji', 'tokyometro-oji-kamiya', 'tokyometro-shimo', 'tokyometro-akabane-iwabuchi'], 'N'),
    sourceUrl: 'https://www.tokyometro.jp/station/line_namboku/index.html',
  }),
  defineRoute({
    id: 'metro-fukutoshin', operatorId: 'tokyo-metro', name: 'ふくとしんせん', color: '#bb641d',
    unlockMilestoneId: metroRouteUnlockMilestoneId('metro-fukutoshin'),
    segmentLabel: 'わこうし 〜 しぶや（16えき）',
    stops: numberedStops(['tokyometro-wakoshi', 'tokyometro-chikatetsu-narimasu', 'tokyometro-chikatetsu-akatsuka', 'tokyometro-heiwadai', 'tokyometro-hikawadai', 'tokyometro-kotake-mukaihara', 'tokyometro-senkawa', 'tokyometro-kanamecho', 'tokyometro-ikebukuro', 'tokyometro-zoshigaya', 'tokyometro-nishi-waseda', 'tokyometro-higashi-shinjuku', 'tokyometro-shinjuku-sanchome', 'tokyometro-kita-sando', 'tokyometro-meiji-jingumae', 'tokyu-ty01'], 'F'),
    sourceUrl: 'https://www.tokyometro.jp/station/line_fukutoshin/index.html',
  }),
]
