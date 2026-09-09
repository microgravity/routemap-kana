# 全国向け鉄道データ設計

## 分割単位

組み込みデータは鉄道会社単位の`RailwayDataset`として管理し、[`src/data/stations.ts`](../src/data/stations.ts)だけで統合します。

| ファイル | 所有するデータ |
| --- | --- |
| `src/data/tokyu.ts` | 東急の駅・路線・会社情報 |
| `src/data/sotetsu.ts` | 相鉄の駅・路線・会社情報 |
| `src/data/tokyoMetro.ts` | 東京メトロの駅・路線・会社情報 |
| `src/data/stations.ts` | データセットの登録、全社横断Map、既存export |
| `src/data/railwayCatalogTypes.ts` | データセット型、全国版ID生成、整合性検証 |

1社のデータが大きくなった場合は、会社ファイルを`会社名/index.ts`へ置き換え、路線別ファイルをその下で統合します。アプリ側は引き続き`stations.ts`だけを参照します。

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
3. 会社単位の`RailwayDataset`を作り、`idScheme: 'jp-v2'`を指定します。
4. 共有駅は新規登録せず、既存のStation IDを`orderedStationIds`から参照します。
5. `src/data/stations.ts`の`railwayDatasets`へデータセットを1件追加します。
6. `validateRailwayCatalog`と全テストで、ID重複、未登録駅、会社・路線の不一致、駅番号件数を確認します。

JR西日本を姫新線だけで開始しても、`jp.dataset.jr-west`に1路線だけ収録できます。後からJR西日本の別路線を追加する場合は同じデータセットへ路線モジュールを足し、会社IDや姫新線IDは変更しません。

## データセットの境界

- `stations`には、そのデータセットが最初に登録する駅だけを置きます。
- `routes`は他社データセットが所有する共有駅IDを参照できます。
- `operator.routeIds`は、そのデータセットの`routes`と完全に一致させます。
- `officialStationCount`は公式が案内する路線別・会社別の駅数で、共有駅を統合した`builtInStations.length`とは別の値です。
- 進捗、スタンプ、プロフィール集計は統合後の既存データから算出し、データセットには保存しません。
