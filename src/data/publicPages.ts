import { builtInStationById, railwayOperatorById, routes } from './stations'
import type { Route } from '../domain/types'

const sitemapNamespace = 'http://www.sitemaps.org/schemas/sitemap/0.9'

function escapeMarkup(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character)
}

export function routePermalinkPath(routeId: string): string {
  return `routes/${encodeURIComponent(routeId)}/`
}

function urlset(locations: readonly string[], lastmod: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n<urlset xmlns="${sitemapNamespace}">\n${locations.map((location) => `  <url>\n    <loc>${escapeMarkup(location)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`
}

function routePage(route: Route, siteBase: URL, basePath: string): string {
  const operator = railwayOperatorById.get(route.operatorId)
  if (!operator) throw new Error(`路線の鉄道会社が見つかりません: ${route.id}`)
  const stations = route.orderedStationIds.map((id, index) => {
    const station = builtInStationById.get(id)
    if (!station) throw new Error(`路線の駅が見つかりません: ${route.id} / ${id}`)
    return { ...station, code: route.stationCodes[index] }
  })
  const first = stations[0]
  const last = stations.at(-1)
  if (!first || !last) throw new Error(`路線に駅がありません: ${route.id}`)
  const title = `${operator.displayName} ${route.name}の駅一覧 | じぶんの ろせんず`
  const description = `${operator.displayName} ${route.name}の${stations.length}駅を、${first.displayName}から${last.displayName}まで順番に紹介します。駅名のひらがなを練習できます。`
  const canonical = new URL(routePermalinkPath(route.id), siteBase).href
  const appUrl = `${basePath}#/?route=${encodeURIComponent(route.id)}`
  const stationItems = stations.map((station) => {
    return `<li><span class="station-code">${escapeMarkup(station.code)}</span><span class="station-name">${escapeMarkup(station.displayName)}</span><span class="station-reading">${escapeMarkup(station.reading)}</span></li>`
  }).join('\n')

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeMarkup(title)}</title>
  <meta name="description" content="${escapeMarkup(description)}" />
  <link rel="canonical" href="${escapeMarkup(canonical)}" />
  <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-MXG5B2NT');
  </script>
  <style>
    :root { color-scheme: light; font-family: system-ui, sans-serif; color: #26383d; background: #fffbf2; }
    * { box-sizing: border-box; }
    body { max-width: 920px; margin: 0 auto; padding: 24px clamp(16px, 4vw, 48px) 64px; }
    a { color: #245b68; }
    header { border-bottom: 8px solid ${escapeMarkup(route.color)}; padding-bottom: 20px; }
    header a { font-weight: 800; text-decoration: none; }
    h1 { font-size: clamp(1.7rem, 5vw, 3rem); margin-bottom: 8px; }
    p { line-height: 1.7; }
    .app-link { display: inline-block; padding: 14px 20px; border-radius: 14px; background: #26383d; color: white; font-weight: 800; text-decoration: none; }
    ol { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 10px; }
    li { display: grid; grid-template-columns: 4.5em 1fr; align-items: center; gap: 2px 10px; padding: 14px; border: 1px solid #ddd7c8; border-radius: 14px; background: white; }
    .station-code { grid-row: span 2; color: #52656a; font-size: .85rem; font-weight: 800; }
    .station-name { color: #26383d; font-size: 1.15rem; font-weight: 800; }
    .station-reading { color: #52656a; font-size: .85rem; }
  </style>
</head>
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MXG5B2NT" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <header><a href="${escapeMarkup(basePath)}">じぶんの ろせんず</a><h1>${escapeMarkup(operator.displayName)} ${escapeMarkup(route.name)}</h1><p>${escapeMarkup(first.displayName)} → ${escapeMarkup(last.displayName)}（${stations.length}駅）</p><a class="app-link" href="${escapeMarkup(appUrl)}">この ろせんを みる</a></header>
  <main><h2>えきの いちらん</h2><p>ひらがなの れんしゅうは、ろせんずから はじめてね。</p><ol>${stationItems}</ol></main>
</body>
</html>\n`
}

/** 公開URLはハッシュ画面とは別に、ビルド時に実在するHTMLとして生成する。 */
export function publicPageAssets(siteUrl: string, basePath: string, lastmod: string): Record<string, string> {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(lastmod)) throw new Error(`サイトマップの更新日が不正です: ${lastmod}`)
  if (!basePath.startsWith('/') || !basePath.endsWith('/')) throw new Error(`公開パスが不正です: ${basePath}`)
  const siteBase = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`)
  if (siteBase.protocol !== 'https:') throw new Error(`公開URLはHTTPSを使用してください: ${siteUrl}`)
  const home = siteBase.href
  const pageSitemap = new URL('sitemap-pages.xml', siteBase).href
  const routeSitemap = new URL('sitemap-routes.xml', siteBase).href
  const routeUrls = routes.map((route) => new URL(routePermalinkPath(route.id), siteBase).href)
  const assets: Record<string, string> = {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n<sitemapindex xmlns="${sitemapNamespace}">\n${[pageSitemap, routeSitemap].map((location) => `  <sitemap>\n    <loc>${escapeMarkup(location)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`).join('\n')}\n</sitemapindex>\n`,
    'sitemap-pages.xml': urlset([home], lastmod),
    'sitemap-routes.xml': urlset(routeUrls, lastmod),
  }
  for (const route of routes) assets[`${routePermalinkPath(route.id)}index.html`] = routePage(route, siteBase, basePath)
  return assets
}
