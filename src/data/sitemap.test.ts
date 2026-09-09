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

  it('同意前にGTMを読み込むタグを公開HTMLへ直書きしない', () => {
    expect(html).not.toContain('googletagmanager.com/gtm.js')
    expect(html).not.toContain('G-CVGD2ZHNYD')
  })
})
