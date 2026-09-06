# 出典とライセンス

確認日: 2026-09-06

## 駅情報

駅名、駅番号、駅順、所属路線、読みは東急電鉄公式情報を基準にしました。公式路線図画像、企業ロゴ、公式の図上配置は使用していません。アプリの路線図、駅印、電車は独自の模式表現です。

- [東急線 路線図](https://www.tokyu.co.jp/railway/map/)
- [東急線 駅名一覧](https://www.tokyu.co.jp/railway/station/)
- [東急電鉄 事業について（9路線）](https://www.tokyu.co.jp/railway/company/business/)
- [東急線99駅の案内](https://www.tokyu.co.jp/global/railway/line/)
- [東横線](https://www.tokyu.co.jp/railway/ty/)
- [目黒線](https://www.tokyu.co.jp/railway/mg/)
- [東急新横浜線](https://www.tokyu.co.jp/railway/sh/)
- [田園都市線](https://www.tokyu.co.jp/railway/dt/)
- [大井町線](https://www.tokyu.co.jp/railway/om/)
- [池上線](https://www.tokyu.co.jp/railway/ik/)
- [東急多摩川線](https://www.tokyu.co.jp/railway/tm/)
- [世田谷線](https://www.tokyu.co.jp/railway/sg/)
- [こどもの国線](https://www.tokyu.co.jp/railway/kd/)
- 読みの代表確認: [自由が丘駅](https://www.tokyu.co.jp/area/jiyugaoka/station/)、[大岡山駅](https://www.tokyu.co.jp/area/ookayama/station/)、[雪が谷大塚駅](https://www.tokyu.co.jp/area/yukigaya-otsuka/station/)、[御嶽山駅](https://www.tokyu.co.jp/area/ontakesan/station/)、[池上駅](https://www.tokyu.co.jp/area/ikegami/station/)

公式の事業案内は9路線・99駅としています。本アプリは「同じ実在駅を路線ごとに重複登録しない」方針で、三軒茶屋を田園都市線・世田谷線の共有IDとして扱うため、Stationレコードは98件です。路線別の駅所属は115件あり、各路線の公式駅数と駅順を保持しています。三軒茶屋は公式駅ページでも両線を一ページで案内する一方、改札と所在地が分かれているため、公式の99駅は鉄道・軌道の施設を別に数える運用上の集計と判断しました。

大井町線の公式駅一覧は16駅です。二子新地・高津は田園都市線のStationとして収録し、[二子新地駅の公式案内](https://www.tokyu.co.jp/area/futako-shinchi/station/)と公式時刻表の注記に基づき「大井町線の一部各停が停車」と路線画面へ表示します。大井町線の`orderedStationIds`へは重複追加していません。

## ひらがな画順SVG

[`src/data/kana/glyphs`](../src/data/kana/glyphs)の79ファイルは、Kyleによる [strokesvg](https://github.com/zhengkyl/strokesvg) の`dist/hiragana`から取得しました。取得元commitは [`e4c2c91034e03c9c2f4e95f14f2361a948f52cd0`](https://github.com/zhengkyl/strokesvg/commit/e4c2c91034e03c9c2f4e95f14f2361a948f52cd0) です。

かなSVGはKlee Oneフォント由来で、SIL Open Font License 1.1です。strokesvgのSVG構造と補助コードはMIT Licenseです。本アプリでは配布済みSVGの輪郭と手書き中心線をそのまま同梱し、CSSで色とアニメーションを与えています。

著作権・ライセンス通知全文: [`licenses/strokesvg-LICENSE.txt`](../licenses/strokesvg-LICENSE.txt)

初期駅で使う全文字にSVGがあることは自動テストで確認します。親が追加した未対応文字にはこのデータを推測適用せず、端末のフォント見本と自由書きを提供します。

## GitHub Pages

公開workflowはGitHub公式資料に沿っています。

- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [actions/configure-pages の base_path出力](https://github.com/actions/configure-pages/blob/main/action.yml)
