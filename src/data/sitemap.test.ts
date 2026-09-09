import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('検索エンジン向け公開ファイル', () => {
  const sitemap = readFileSync(resolve(process.cwd(), 'public/sitemap.xml'), 'utf8')
  const robots = readFileSync(resolve(process.cwd(), 'public/robots.txt'), 'utf8')

  it('公開URLをサイトマップへ重複なく登録する', () => {
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1])
    expect(locations).toEqual(['https://microgravity.github.io/routemap-kana/'])
    expect(locations.every((location) => !location.includes('#'))).toBe(true)
  })

  it('robots.txtからサイトマップを案内する', () => {
    expect(robots).toContain('Sitemap: https://microgravity.github.io/routemap-kana/sitemap.xml')
  })
})
