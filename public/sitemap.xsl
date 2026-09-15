<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>じぶんの ろせんず — サイトマップ</title>
        <style>
          body { max-width: 1100px; margin: 0 auto; padding: 30px 20px; background: #fffbf2; color: #26383d; font-family: system-ui, sans-serif; }
          h1 { font-size: 1.7rem; }
          p { line-height: 1.6; }
          a { color: #245b68; overflow-wrap: anywhere; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; }
          th, td { padding: 12px; border-bottom: 1px solid #e7e0d3; text-align: left; }
          th { background: #e8f4f2; }
          @media (max-width: 600px) { th, td { padding: 8px; font-size: .8rem; } }
        </style>
      </head>
      <body>
        <h1>じぶんの ろせんず — サイトマップ</h1>
        <p>このXMLは検索エンジン向けの公開URL一覧です。</p>
        <xsl:choose>
          <xsl:when test="sm:sitemapindex">
            <p><xsl:value-of select="count(sm:sitemapindex/sm:sitemap)" /> 個のサイトマップを収録しています。</p>
            <table><thead><tr><th>サイトマップ</th><th>更新日</th></tr></thead><tbody>
              <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                <tr><td><a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></td><td><xsl:value-of select="sm:lastmod" /></td></tr>
              </xsl:for-each>
            </tbody></table>
          </xsl:when>
          <xsl:otherwise>
            <p><xsl:value-of select="count(sm:urlset/sm:url)" /> ページを収録しています。</p>
            <table><thead><tr><th>ページURL</th><th>更新日</th></tr></thead><tbody>
              <xsl:for-each select="sm:urlset/sm:url">
                <tr><td><a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></td><td><xsl:value-of select="sm:lastmod" /></td></tr>
              </xsl:for-each>
            </tbody></table>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
