# 出典とライセンス

確認日: 2026-09-06

## 駅情報

駅名、駅番号、駅順、所属路線、読みは東急電鉄公式情報を基準にしました。公式路線図画像、企業ロゴ、公式の図上配置は使用していません。アプリの路線図、駅印、電車は独自の模式表現です。

- [東急線 路線図](https://www.tokyu.co.jp/railway/map/)
- [東横線](https://www.tokyu.co.jp/railway/ty/)
- [目黒線](https://www.tokyu.co.jp/railway/mg/)
- [池上線](https://www.tokyu.co.jp/railway/ik/)
- 読みの代表確認: [自由が丘駅](https://www.tokyu.co.jp/area/jiyugaoka/station/)、[大岡山駅](https://www.tokyu.co.jp/area/ookayama/station/)、[雪が谷大塚駅](https://www.tokyu.co.jp/area/yukigaya-otsuka/station/)、[御嶽山駅](https://www.tokyu.co.jp/area/ontakesan/station/)、[池上駅](https://www.tokyu.co.jp/area/ikegami/station/)

## ひらがな画順SVG

[`src/data/kana/glyphs`](../src/data/kana/glyphs)の79ファイルは、Kyleによる [strokesvg](https://github.com/zhengkyl/strokesvg) の`dist/hiragana`から取得しました。取得元commitは [`e4c2c91034e03c9c2f4e95f14f2361a948f52cd0`](https://github.com/zhengkyl/strokesvg/commit/e4c2c91034e03c9c2f4e95f14f2361a948f52cd0) です。

かなSVGはKlee Oneフォント由来で、SIL Open Font License 1.1です。strokesvgのSVG構造と補助コードはMIT Licenseです。本アプリでは配布済みSVGの輪郭と手書き中心線をそのまま同梱し、CSSで色とアニメーションを与えています。

著作権・ライセンス通知全文: [`licenses/strokesvg-LICENSE.txt`](../licenses/strokesvg-LICENSE.txt)

初期駅で使う全文字にSVGがあることは自動テストで確認します。親が追加した未対応文字にはこのデータを推測適用せず、端末のフォント見本と自由書きを提供します。

## GitHub Pages

公開workflowはGitHub公式資料に沿っています。

- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [actions/configure-pages の base_path出力](https://github.com/actions/configure-pages/blob/main/action.yml)
