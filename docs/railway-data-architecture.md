# 全国向け鉄道データ設計

## 分割単位

組み込みデータは鉄道会社単位の`RailwayDataset`として管理し、[`src/data/stations.ts`](../src/data/stations.ts)だけで統合します。

| ファイル | 所有するデータ |
| --- | --- |
| `src/data/tokyu.ts` | 東急の駅・路線・会社情報 |
| `src/data/sotetsu.ts` | 相鉄の駅・路線・会社情報 |
| `src/data/tokyoMetro.ts` | 東京メトロの駅・会社情報とデータセット統合 |
| `src/data/operators/tokyoMetro/routes.ts` | 東京メトロの路線・駅順・駅番号 |
| `src/data/stations.ts` | データセットの登録、全社横断Map、既存export |
| `src/data/railwayCatalogTypes.ts` | データセット型、全国版ID生成、整合性検証 |

1社のデータが大きくなった場合は、まず駅マスターと路線定義を会社ディレクトリへ分離します。東京メトロがこの方式です。路線定義が300行を超える場合は、その会社の`routes/`配下を1路線1ファイルへ分けます。アプリ側は引き続き`stations.ts`だけを参照します。

## 路線ビルダーと検証

路線は`defineRoute`へ`{ stationId, code }`の組を渡して作ります。連番の駅番号は`numberedStops`を使用します。`orderedStationIds`と`stationCodes`を別々に手書きして重複管理しないでください。会社情報は`defineRailwayDataset`から作り、`operator.routeIds`を路線定義から導出します。

`validateRailwayCatalog`は、ID重複、共有駅の参照漏れ、会社と路線の不一致に加え、次も検査します。

- 路線内の駅ID・駅番号の重複と空欄
- 駅IDと駅番号の件数、空路線
- 駅名読みのUnicode NFC
- 会社・路線・駅出典のHTTPS URL
- 公式駅数が正の整数であること

テストには全駅名リストを再掲せず、起終点、件数、駅番号、主要な途中駅、共有Station IDとカタログ検証を置きます。公式順の唯一の正は路線データです。

## IDの互換性

公開済みの駅ID・路線ID・会社IDは`legacy-v1`として永久に維持します。現在の駅IDはlocalStorageの進捗キー、路線IDはカスタム駅の所属や解除記録、URLに使われているため、全国版形式への一括改名は行いません。

新しく追加する会社は`jp-v2`を指定し、`nationwideRailwayId`で次のIDを生成します。

| 種類 | 形式 | 姫新線を追加する場合の例 |
| --- | --- | --- |
| データセット | `jp.dataset.{事業者slug}` | `jp.dataset.jr-west` |
| 会社 | `jp.operator.{事業者slug}` | `jp.operator.jr-west` |
| 路線 | `jp.route.{事業者slug}.{路線slug}` | `jp.route.jr-west.kishin` |
| 駅 | `jp.station.{都道府県JISコード}.{地点slug}` | `jp.station.28.himeji` |

駅IDだけは事業者に所属させません。同じ実在地点を複数社・複数路線が使う場合に、最初に登録した1件の駅を共有するためです。都道府県境の駅は駅所在地のJISコードを使用します。同じ都道府県内でslugが衝突する場合は、市区町村など変わりにくい地点情報をslugへ加えます。

駅番号、配列位置、駅名の漢字表記は変更される可能性があるためIDにしません。一度公開したIDは、改称・駅番号変更・路線移管があっても変更せず、表示情報と所属路線だけを更新します。廃駅も進捗復元のためIDを別の駅へ再利用しません。

## 会社・路線を追加する手順

1. 既存カタログに同じ実在駅がないか確認します。
2. `nationwideRailwayId`で会社、路線、新規駅のIDを決めます。
3. `defineRoute`と`defineRailwayDataset`で会社単位のデータセットを作り、`idScheme: 'jp-v2'`を指定します。
4. 共有駅は新規登録せず、既存のStation IDを`stops`から参照します。
5. `src/data/stations.ts`の`railwayDatasets`へデータセットを1件追加します。
6. `validateRailwayCatalog`と全テストで、ID重複、未登録駅、会社・路線の不一致、駅番号件数を確認します。

JR西日本を姫新線だけで開始しても、`jp.dataset.jr-west`に1路線だけ収録できます。後からJR西日本の別路線を追加する場合は同じデータセットへ路線モジュールを足し、会社IDや姫新線IDは変更しません。

## データセットの境界

- `stations`には、そのデータセットが最初に登録する駅だけを置きます。
- `routes`は他社データセットが所有する共有駅IDを参照できます。
- `operator.routeIds`は、そのデータセットの`routes`と完全に一致させます。
- `officialStationCount`は公式が案内する路線別・会社別の駅数で、共有駅を統合した`builtInStations.length`とは別の値です。
- 進捗、スタンプ、プロフィール集計は統合後の既存データから算出し、データセットには保存しません。

## 解除キャンペーン

会社・路線の段階解除は[`src/config/unlockCampaigns.ts`](../src/config/unlockCampaigns.ts)の`RouteChoiceCampaign`へ宣言します。前提路線、初期路線、選択解除路線、スタンプ対象、きっぷ獲得閾値、旧保存データの移行版を1か所へ置き、画面と状態更新は事業者IDからキャンペーンを参照します。

公開済みのマイルストーンIDはlocalStorageとバックアップの互換キーなので変更しません。新キャンペーンのIDには版を含め、条件を後から暗黙に拡張しないでください。

## 遅延読み込みの導入条件

現在は3社21路線・組み込みStation 264件で、初期画面、索引、サイトマップ生成を単純な静的データとして扱う方が保守しやすいため、会社データの遅延読み込みは導入していません。次のいずれかに達した時点で、会社単位の動的importと索引用軽量メタデータを再検討します。

- 収録会社が6社以上、または組み込みStationが1,000件以上
- 圧縮前のメインJavaScriptが750KBを超える
- iPad相当端末で初期表示またはひらがな索引生成が体感できるほど遅くなる

遅延読み込みを導入しても、Station ID、路線ID、URL、localStorageスキーマは変更しません。ビルド時の公開路線ページとサイトマップには全データを読み込みます。
