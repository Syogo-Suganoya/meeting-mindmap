# 開発ガイド(CONTRIBUTING)

meeting-mindmap のローカル開発環境のセットアップと開発ルールをまとめる。
本番リリース手順は [DEPLOY.md](DEPLOY.md) を参照。

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16(App Router)+ React 19 + TypeScript |
| スタイル | Tailwind CSS 4 |
| マインドマップ描画 | `@xyflow/react`(react-flow)+ `dagre`(自動レイアウト) |
| AI | Gemini API(`@google/genai`、モデル `gemini-2.5-flash`)。Gemini Files APIで録画/録音データ(音声・動画)を直接理解し、文字起こし+質問/回答の抽出・要約・マッチ度判定・関係(一致/対立)判定を一括で行う |
| データ保存 | ブラウザの `localStorage` のみ。サーバー側DBなし |

## セットアップ

前提: Node.js 20+

```bash
cd meeting-mindmap

# 1. 依存関係のインストール
npm install

# 2. 環境変数の設定
cp .env.local.example .env.local
# GEMINI_API_KEY は https://aistudio.google.com/apikey で発行。
# 未設定でもアプリは起動するが、/api/analyze(録画データ解析)は全てエラーになる

# 3. 開発サーバーの起動
npm run dev
```

http://localhost:3000 で起動する。

> `next dev`/`next build` には `--webpack` を付けている(`package.json`参照)。
> 本リポジトリのパスに日本語(非ASCII文字)が含まれており、Turbopackがパスのバイト境界処理でパニックするため、webpackバンドラを使う回避策を入れている。

## ディレクトリ構成

```
meeting-mindmap/
├── app/
│   ├── page.tsx              # ランディングページ(機能紹介)
│   ├── board/page.tsx        # メイン画面(マインドマップ本体)
│   ├── api/analyze/route.ts  # Gemini呼び出し(録画/録音データの理解・文字起こし・質問/回答抽出・マッチ度・関係判定)
│   └── components/
│       ├── MindMapCanvas.tsx # react-flowラッパー
│       ├── QuestionNode.tsx / AnswerNode.tsx  # カスタムノード
│       ├── RecordingUploadPanel.tsx  # 録画/録音ファイルのアップロード操作
│       └── MismatchToast.tsx    # ズレ警告トースト
├── lib/
│   ├── types.ts        # データモデル(MindMapNode/Edge、matchScore閾値など)
│   ├── gemini.ts        # Geminiクライアント(遅延初期化・APIキー未設定時のエラー処理)
│   ├── prompts.ts       # /api/analyze のシステムプロンプト
│   ├── layout.ts        # dagreによる自動レイアウト
│   ├── storage.ts       # localStorage永続化
│   ├── mindmap-actions-context.tsx  # ノード操作をContext経由で子孫コンポーネントに渡す
│   ├── hooks/
│   │   └── useMindMapStore.ts      # ノード/エッジのCRUD、関係エッジ追加、dagre連携
│   └── samples/         # サンプルシナリオ(予算会議/愛知県議会/学生討論会/ひろゆき×DaiGo討論)
├── .env.local.example / Dockerfile / docker-compose.yml
```

## 設計上のポイント

- **状態管理はreact-flowが真実のソース**:`useNodesState`/`useEdgesState`をそのまま使い、`useMindMapStore`はその上に被せるCRUD関数群に留める。独立したstateは持たない。
- **dagre自動レイアウトと手動配置の共存**:dagreは一部ノードだけ固定する機能を持たないため、全ノードの座標を計算した後、`isManual === true`(ユーザーがドラッグ/編集確定済み)なノードだけ元の座標に戻すポスト処理を`lib/layout.ts`で行う。
- **回答↔回答の関係エッジ**:質問→回答の階層エッジ(`data`なし)とは別に、`data: { kind: "agree" | "conflict", reason }`を持つエッジで回答同士の一致/対立を表現する。`applyDagreLayout`は`data`ありのエッジを階層計算から除外する。
- **matchScore(質問と回答の噛み合い度)と関係判定(回答同士の一致/対立)は別軸**:前者は`AnswerNodeData.matchScore`、後者は回答間のエッジで表現する。混同しないこと。
- **録画データの解析はGemini Files API経由・一括処理**:`app/api/analyze/route.ts`はアップロードされた音声/動画ファイルを`client.files.upload()`でGeminiに渡し、`state`が`ACTIVE`になるまで`client.files.get()`でポーリング(2秒間隔・最大180秒)した後、`createPartFromUri`でPart化して`generateContent`に渡す。解析後は`client.files.delete()`でGemini側のファイルをbest-effortで削除する。既存の質問/回答一覧(`existingQuestions`/`existingAnswers`)は同じボードに複数回アップロードした場合の重複判定・関係判定のために引き続き使う。
- **Gemini呼び出しはresponseSchemaで構造化出力**:zodは導入せず、`@google/genai`の`responseSchema`(`Type.OBJECT`等)を信頼し、パース後はTypeScriptの型アサーションで済ませる。

## 開発ルール

### コミット前チェック

```bash
npx tsc --noEmit   # 型エラーがないこと
npm run lint       # Lintが通ること
npm run build      # 本番ビルドが通ること
```

### コーディング規約

- `nodeTypes`/`edgeTypes`のようなreact-flowに渡すオブジェクトはモジュールスコープ定数にする(毎レンダー再生成すると警告が出てパフォーマンスが落ちる)
- カスタムエッジコンポーネントは追加しない。色分け・ラベルはreact-flow標準エッジの`style`/`label`/`labelBgStyle`プロパティだけで表現する(`lib/hooks/useMindMapStore.ts`の`addAnswerRelation`、`lib/samples/types.ts`の`buildRelationEdge`を参照)
- React Compilerの制約により、refの書き換えは`useEffect`内で行う(レンダー中の直接代入は不可)。自己再帰する`useCallback`は書かない(メモ化が壊れるため`while`ループ等に置き換える)
- サンプルシナリオ(`lib/samples/`)に実在のYouTube動画・議事録由来のデータを追加する場合、原文の逐語引用はせず要約・パラフレーズしたテキストのみを使う。生の文字起こしファイルは`_memo/`配下に置き、`.gitignore`でコミット対象外にする

### 動作確認の目安

`/`(ランディング)→ `/board`でシナリオ選択 → 録画/録音ファイルをアップロード → 解析中表示 → 質問/回答ノード自動生成 → ズレ警告トースト・関係エッジ表示 → リロードで`localStorage`保持、の一連の流れが通ること。

`/api/analyze`をAPIレベルで確認する場合(multipart/form-data):

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "recording=@sample.mp3" \
  -F "existingQuestions=[]" \
  -F "existingAnswers=[]"
```
