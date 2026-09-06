import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

function socialImageMeta(html: string): string {
  const siteUrl = process.env.PUBLIC_SITE_URL
  if (!siteUrl) return html.replace('    <!-- social-image -->\n', '')
  try {
    const base = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`)
    if (base.protocol !== 'https:') return html.replace('    <!-- social-image -->\n', '')
    const imageUrl = new URL('og.png', base).href
    const tags = [
      `<meta property="og:image" content="${imageUrl}" />`,
      `<meta name="twitter:image" content="${imageUrl}" />`,
    ].join('\n    ')
    return html.replace('<!-- social-image -->', tags)
  } catch {
    return html.replace('    <!-- social-image -->\n', '')
  }
}

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), { name: 'social-image-meta', transformIndexHtml: socialImageMeta }],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
