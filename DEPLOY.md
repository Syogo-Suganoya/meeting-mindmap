# デプロイ手順

meeting-mindmap を本番環境へリリースするための手順をまとめる。

デプロイ方法は2通り。

- **方法A：Firebase App Hosting（画面操作でデプロイ、推奨）** — サーバー管理不要。GitHub連携で自動ビルド・自動HTTPS
- **方法B：Docker（VPS / 自前サーバー）** — 既存の`Dockerfile`/`docker-compose.yml`を使用

## 構成要素

| 要素 | 内容 |
| --- | --- |
| アプリ | Next.js 16（App Router）。`next build`（standalone出力）→ `node server.js` で稼働 |
| AI | Gemini API（必須）。`/api/analyze`が録画/録音データの文字起こし・Q&A抽出・要約・マッチ度判定を行う |
| データ保存 | ブラウザの`localStorage`のみ。サーバー側DBなし |
| 録画アップロード | ブラウザから音声/動画ファイルをアップロードし、Gemini Files API経由で処理する。大きな録画をアップロードする場合はリバースプロキシの`client_max_body_size`等のボディサイズ上限に注意 |

## 必要な環境変数

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | Google AI Studio（https://aistudio.google.com/apikey）で発行 |

未設定でもアプリ自体は起動するが、`/api/analyze`を呼ぶ操作(録画データの解析)は全てエラーになる。

## 共通：事前チェック（ローカル）

どちらの方法でも、デプロイ前にローカルでビルドが通ることを確認する。

```bash
cd meeting-mindmap
npm ci
npx tsc --noEmit   # 型チェック
npm run lint       # Lint
npm run build      # 本番ビルドが通ることを確認(--webpackを使用、next.config.tsのoutput:standaloneも適用される)
```

---

## 方法A：Firebase App Hosting（画面操作でデプロイ）

前提：GitHubにこのリポジトリをpush済みであること。

### A-1. Firebase CLIのセットアップ

```bash
npm install -g firebase-tools
firebase login
```

### A-2. App Hostingバックエンドの作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成（既存プロジェクトでも可）
2. 左メニューから「App Hosting」を選び、「バックエンドを作成」をクリックする
3. GitHubリポジトリとの連携を求められたら、このリポジトリを選択して認可する
4. **Root Directory**（またはApp Rootとして表示される項目）に `meeting-mindmap` を指定する（モノレポなので必須）
5. デプロイするブランチ（例：`main`）を選択する

> Firebase Console の画面構成は変更されることがあるため、上記の手順と表示が異なる場合は公式ドキュメント（https://firebase.google.com/docs/app-hosting）を参照する。

### A-3. 環境変数の設定

1. 作成したバックエンドの設定画面から環境変数（またはSecret Manager経由のシークレット）を追加する
2. `GEMINI_API_KEY` にA-2で発行したキーを設定する

`apphosting.yaml` をリポジトリに置いて環境変数を管理する方法もある（その場合はシークレット値そのものは含めず、Secret Manager参照の形にする）。

### A-4. デプロイ

連携後、選択したブランチへのpushで自動的にビルド・デプロイが始まる。Firebase App Hostingは Next.js の App Router / Route Handler によるSSRをネイティブサポートしており、自動でHTTPSが有効になる。

### A-5. 動作確認

1. バックエンドの詳細画面に表示されるURL（`https://xxxx.web.app` 等）を開く
2. 「デプロイ後の動作確認」（後述）を一通り確認する

### A-6. 2回目以降のリリース

連携したブランチにpushすると自動でビルド・デプロイされる。

### A-7. GitHub Actions によるビルド検証とDeployments記録

`.github/workflows/deploy.yml` が `main` へのpushで動く。役割は2つ。

1. **ビルド検証**：`npm ci` → `npx tsc --noEmit` → `npm run lint` → `npm run build` を実行し、壊れたコードがデプロイされていないかを後追いで検知する
2. **Deployments欄への記録**：ジョブに `environment: production` を設定しているため、GitHubのリポジトリトップ（About）と Environments 画面に `production` とその公開URLが表示される

**このワークフローはデプロイを実行しない。** 実際のビルド・ロールアウトは Firebase App Hosting のGitHub連携が行っており、その成否はコミットの **Checks 欄（`App Hosting - Rollout ...`）** に出る。ワークフローが success でもロールアウトが失敗している可能性はあるため、リリースの最終確認は Checks 欄を見ること。

バックエンドIDやリージョンを変更した場合は、`deploy.yml` 内の `environment.url` も合わせて更新する。

---

## 方法B：Docker（VPS / 自前サーバー）

### B-1. 環境変数の準備

```bash
cd meeting-mindmap
cp .env.local.example .env
# .env を開いて GEMINI_API_KEY を実際のキーに書き換える
```

### B-2. 起動

```bash
docker compose up -d --build
```

`docker-compose.yml`はポート`3000:3000`で公開する構成になっている。

### B-3. リバースプロキシ（推奨）

本番運用では、nginx等のリバースプロキシでTLS終端し、HTTPS経由でDockerコンテナの3000番へプロキシする構成を推奨する（例：nginx + Let's Encrypt(certbot)）。大きな録画ファイルをアップロードする場合は、nginxの`client_max_body_size`をアップロード予定の最大ファイルサイズに合わせて引き上げること。

### B-4. 更新

```bash
git pull
docker compose up -d --build
```

### B-5. 停止

```bash
docker compose down
```

---

## デプロイ後の動作確認（共通）

1. `/`（ランディングページ）が表示される
2. `/board` を開き、シナリオ選択ドロップダウンから好きなシナリオを選べる
3. 録画/録音ファイルを選択して「解析する」を押す → 「解析中」表示 → 数十秒〜数分後に質問/回答ノードが自動生成される
4. 質問と噛み合わない回答は赤枠+警告トーストが表示される
5. ノードをドラッグ・編集した後にリロードしても内容が保持される（`localStorage`）

## 注意事項・既知の制約

- **録画アップロードのファイルサイズ上限**は現状300MB程度を想定。Docker運用でnginx等のリバースプロキシを使う場合は`client_max_body_size`をあわせて調整すること。
- **データはブラウザの`localStorage`のみに保存される**ため、複数人・複数端末での共有はできない（README「将来構想」参照）。
- `GEMINI_API_KEY`未設定でもアプリ自体（ランディング・マインドマップ表示・サンプルシナリオ）は問題なく動作するが、録画データの解析（`/api/analyze`）は全てエラーになる。
