import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('検索エンジン向け公開ファイル', () => {
  const sitemap = readFileSync(resolve(process.cwd(), 'public/sitemap.xml'), 'utf8')
  const robots = readFileSync(resolve(process.cwd(), 'public/robots.txt'), 'utf8')
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

  it('公開URLをサイトマップへ重複なく登録する', () => {
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1])
    expect(locations).toEqual(['https://microgravity.github.io/routemap-kana/'])
    expect(locations.every((location) => !location.includes('#'))).toBe(true)
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
