# じぶんの ろせんず

駅名を聞き、ひらがなを一文字ずつ書き、自分の路線図を育てるiPad向けWebアプリです。書字の正誤採点は行わず、子ども自身の「できた」を記録します。

初版には東横線、目黒線、池上線の各7駅を収録しています。路線図は駅順を表す独自の模式図で、地理的な距離を表す地図ではありません。

## 主な機能

- 全駅を見たり聞いたりできる簡略SVG路線図
- 一文字の音声、駅名全体の音声、指で文字列をなぞる読み上げ
- 画順・始点・番号つきのなぞり書きと自由書き
- 一文字から駅を追加し、隣接駅を電車でつなぐ演出
- 文字位置ごとの途中保存と全位置練習済みの印
- 左利き・右利き、音声、動きを減らす設定
- カスタム駅の追加・編集と既存路線への手動挿入
- 検証つきJSONバックアップ・置換復元

位置情報、地図タイル、Googleマップ連携、ログイン、クラウド同期、AI/OCR採点、Service Workerは初版に含みません。将来の地図連動では駅データに座標または外部地図参照を追加し、現在の模式図データとは分けて扱います。

## 必要環境

- Node.js 22.13以上（CIはNode.js 24）
- npm 11系
- 開発確認: 現行のSafari、Chrome、Firefox
- 主対象: iPad Safari、CSSビューポート 1024×768 / 768×1024相当

## 開発

```bash
npm ci
npm run dev
```

表示されたローカルURLをブラウザで開きます。

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`npm run build`は型検査とテストも実行し、`dist/`へ静的ファイルを生成します。プロジェクトサイト相当のパスをローカルで確認する場合は次のようにします。

```bash
BASE_PATH=/repository-name/ npm run build
```

## GitHub Pagesで公開する

1. このコミットを、公開先として用意したGitHubリポジトリの`main`ブランチへpushします。
2. GitHubで **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします。
3. **Actions** の `Test, build, and deploy Pages` が成功するのを待ちます。
4. workflowの`deploy`結果、または **Settings → Pages** に表示されるURLをiPad Safariで開きます。

workflowはPages設定から`base_path`を取得するため、`/<repository>/`配下でも、ユーザーサイトやカスタムドメインの`/`配下でもアセットを読み込めます。画面URLにはハッシュ方式を使い、駅画面で更新してもPagesの404になりません。

更新時は`main`へpushすると、型検査、13件以上の重要テスト、本番ビルド、Pages公開が順に実行されます。公開先リポジトリとURLはこのソース内に決め打ちしていません。

## iPadで使う

Safariで公開URLを開き、共有ボタンから「ホーム画面に追加」を選択します。初版は完全オフライン対応ではないため、起動時にはネットワークが必要です。音声は端末の日本語音声とSafariの動作に依存し、最初の読み上げは必ず利用者のタップから開始します。

保存先はブラウザ内の`localStorage`です。ブラウザデータの削除などで失われる場合があり、Safari表示とホーム画面表示の間や別端末へ自動同期される保証はありません。「おうちのひと」画面から定期的にJSONを書き出してください。

## データと資料

- [データ追加ガイド](docs/data-guide.md)
- [駅・画順データの出典とライセンス](docs/sources-and-licenses.md)
- [iPad実機チェックリスト](docs/ipad-checklist.md)
- [元の実装仕様](codex-station-hiragana-brief.md)

初版では筆跡そのものを永続保存しません。「できた」にした文字位置、次回の再開位置、駅追加状態を区切りごとに保存します。
