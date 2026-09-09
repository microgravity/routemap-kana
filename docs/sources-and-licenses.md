# 出典とライセンス

確認日: 2026-09-09

## 駅情報

駅名、駅番号、駅順、所属路線、読みは東急電鉄、相模鉄道、東京メトロの公式情報を基準にしました。公式路線図画像、企業ロゴ、公式の図上配置は使用していません。アプリの会社印、路線図、駅印、電車は独自の模式表現です。

### 東急電鉄

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

### 相模鉄道（相鉄）

- [相鉄線 駅・路線図](https://www.sotetsu.co.jp/train/stations/)
- [鉄道事業（旅客3路線の営業区間）](https://www.sotetsu.co.jp/about/companies/transportation/)
- [相鉄線 路線図PDF](https://cdn.sotetsu.co.jp/media/2023/train/stations/download/route-map-download-230318outline.pdf)

相鉄本線（横浜〜海老名）18駅、相鉄いずみ野線（二俣川〜湘南台）8駅、相鉄新横浜線（西谷〜新横浜）3駅を収録しています。相鉄線内では二俣川と西谷のStation IDを共有し、東急線との間では横浜と新横浜の既存Station IDを共有します。そのため、相鉄公式27駅の追加で新設するStationレコードは25件です。

両社合計では12路線、会社ごとの公式駅数の単純合計は126駅、共有駅を統合した組み込みStationレコードは123件、路線別の駅所属は144件です。JR線、みなとみらい線などの直通先と、旅客駅一覧に含まれない厚木線は収録していません。

### 東京メトロ

- [路線・駅の情報](https://www.tokyometro.jp/station/index.html)
- [50音から駅を探す（駅名・読み）](https://www.tokyometro.jp/station/index03.html)
- [会社概要（9路線・180駅）](https://www.tokyometro.jp/corporate/profile/message/index.html)
- [銀座線](https://www.tokyometro.jp/station/line_ginza/index.html)
- [丸ノ内線](https://www.tokyometro.jp/station/line_marunouchi/index.html)
- [日比谷線](https://www.tokyometro.jp/station/line_hibiya/index.html)
- [東西線](https://www.tokyometro.jp/station/line_tozai/index.html)
- [千代田線](https://www.tokyometro.jp/station/line_chiyoda/index.html)
- [有楽町線](https://www.tokyometro.jp/station/line_yurakucho/index.html)
- [半蔵門線](https://www.tokyometro.jp/station/line_hanzomon/index.html)
- [南北線](https://www.tokyometro.jp/station/line_namboku/index.html)
- [副都心線](https://www.tokyometro.jp/station/line_fukutoshin/index.html)

東京メトロ公式の9路線・180駅を対象とし、各路線ページに掲載された駅順では185件の路線別駅所属を保持しています。同じ東京メトロ駅を路線ごとに重複登録せず144のStation IDへ統合し、さらに渋谷・中目黒・目黒は既存の東急Station IDを共有するため、新設Stationレコードは141件です。3社合計では21路線、会社ごとの公式駅数の単純合計は306駅、共有駅を統合した組み込みStationレコードは264件、路線別駅所属は329件です。

丸ノ内線は中野坂上から方南町方面へ分岐します。現在の横一列の模式図では、公式路線ページの掲載順に支線3駅を含む全28駅を一つの並びで表示し、画面上に分岐の注記を出します。公式路線図画像、ロゴ、図上配置は使用していません。

## ひらがな画順SVG

[`src/data/kana/glyphs`](../src/data/kana/glyphs)の79ファイルは、Kyleによる [strokesvg](https://github.com/zhengkyl/strokesvg) の`dist/hiragana`から取得しました。取得元commitは [`e4c2c91034e03c9c2f4e95f14f2361a948f52cd0`](https://github.com/zhengkyl/strokesvg/commit/e4c2c91034e03c9c2f4e95f14f2361a948f52cd0) です。

かなSVGはKlee Oneフォント由来で、SIL Open Font License 1.1です。strokesvgのSVG構造と補助コードはMIT Licenseです。本アプリでは配布済みSVGの輪郭と手書き中心線をそのまま同梱し、CSSで色とアニメーションを与えています。

著作権・ライセンス通知全文: [`licenses/strokesvg-LICENSE.txt`](../licenses/strokesvg-LICENSE.txt)

初期駅で使う全文字にSVGがあることは自動テストで確認します。親が追加した未対応文字にはこのデータを推測適用せず、端末のフォント見本と自由書きを提供します。

## 操作アイコン

戻る、音声、手書き、設定、保存などの操作アイコンには、Google Fontsの[Material Symbols](https://developers.google.com/fonts/docs/material_symbols) Rounded 400を使用しています。npmパッケージ`@material-symbols/font-400` version 0.47.1のフォントをアプリ内へ同梱し、外部CDNへ依存せずオフライン時も表示します。

Material SymbolsはApache License 2.0です。著作権・ライセンス通知全文: [`licenses/material-symbols-LICENSE.txt`](../licenses/material-symbols-LICENSE.txt)

## GitHub Pages

公開workflowはGitHub公式資料に沿っています。

- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [actions/configure-pages の base_path出力](https://github.com/actions/configure-pages/blob/main/action.yml)
