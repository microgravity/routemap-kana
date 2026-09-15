import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { routes } from './stations'
import { publicPageAssets, routePermalinkPath } from './publicPages'

describe('検索エンジン向け公開ファイル', () => {
  const assets = publicPageAssets('https://microgravity.github.io/routemap-kana/', '/routemap-kana/', '2026-09-15')
  const robots = readFileSync(resolve(process.cwd(), 'public/robots.txt'), 'utf8')
  const xsl = readFileSync(resolve(process.cwd(), 'public/sitemap.xsl'), 'utf8')
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

  it('索引と子サイトマップを参照形式で生成する', () => {
    const parser = new DOMParser()
    for (const fileName of ['sitemap.xml', 'sitemap-pages.xml', 'sitemap-routes.xml']) {
      const document = parser.parseFromString(assets[fileName], 'application/xml')
      expect(document.querySelector('parsererror')).toBeNull()
      expect(assets[fileName]).toContain('href="sitemap.xsl"')
      expect(assets[fileName]).toContain('<lastmod>2026-09-15</lastmod>')
    }
    expect(assets['sitemap.xml']).toContain('<sitemapindex')
    expect(assets['sitemap.xml']).toContain('sitemap-pages.xml')
    expect(assets['sitemap.xml']).toContain('sitemap-routes.xml')
    expect(assets['sitemap-pages.xml']).toContain('<urlset')
    expect(assets['sitemap-routes.xml']).toContain('<urlset')
    expect(xsl).toContain('sm:sitemapindex')
    expect(xsl).toContain('sm:urlset')
  })

  it('全路線の実在URLを重複・ハッシュなしで登録する', () => {
    const locations = [...assets['sitemap-routes.xml'].matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1])
    expect(locations).toEqual(routes.map((route) => `https://microgravity.github.io/routemap-kana/${routePermalinkPath(route.id)}`))
    expect(new Set(locations).size).toBe(routes.length)
    expect(locations.every((location) => !location.includes('#'))).toBe(true)
    for (const route of routes) {
      const page = assets[`${routePermalinkPath(route.id)}index.html`]
      expect(page).toContain(`<link rel="canonical" href="https://microgravity.github.io/routemap-kana/${routePermalinkPath(route.id)}" />`)
      expect(page.match(/<li>/gu)).toHaveLength(route.orderedStationIds.length)
      expect(page).toContain(`/routemap-kana/#/?route=${route.id}`)
      expect(page).toContain("'GTM-MXG5B2NT'")
      expect(page).not.toContain('G-CVGD2ZHNYD')
    }
  })

  it('公開パスとURLをビルド先に合わせる', () => {
    const rootAssets = publicPageAssets('https://example.jp/', '/', '2026-09-15')
    expect(rootAssets['sitemap.xml']).toContain('https://example.jp/sitemap-routes.xml')
    expect(rootAssets[`${routePermalinkPath(routes[0].id)}index.html`]).toContain('href="/#/?route=')
  })

  it('robots.txtからサイトマップを案内する', () => {
    expect(robots).toContain('Sitemap: https://microgravity.github.io/routemap-kana/sitemap.xml')
  })

  it('Search Console確認タグを公開HTMLに含める', () => {
    expect(html).toContain('<meta name="google-site-verification" content="V6TzJNON6Z1xpYZuBENcSDgeKAh4MYP_4fwsMaSqKj0" />')
  })

  it('GTMをすべての訪問で読み込む', () => {
    expect(html).toContain('googletagmanager.com/gtm.js?id=')
    expect(html).toContain('googletagmanager.com/ns.html?id=GTM-MXG5B2NT')
    expect(html).toContain("'GTM-MXG5B2NT'")
    expect(html).not.toContain('G-CVGD2ZHNYD')
  })
})
