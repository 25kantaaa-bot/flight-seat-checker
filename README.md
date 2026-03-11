# フライト残席チェッカー

航空会社横断でフライトの空席状況を一覧検索できるWebアプリ（MVP）。

Amadeus Flight Offers Search API v2 を使用して、複数の航空会社のフライト情報・残席数・価格を一括表示します。

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Amadeus for Developers API** (テスト環境)

## 機能

- 出発地・目的地（IATAコード）、出発日、乗客数で検索
- 航空会社名（日本語）、便名、出発/到着時刻、所要時間、乗り継ぎ回数を表示
- キャビンクラス別の残席数と価格を表示
- 残席数あり → 緑バッジ / 残席不明 → グレーバッジ で視覚的に区別
- 主要航空会社25社以上の日本語名マッピング
- PCではテーブル表示、スマホではカード表示のレスポンシブ対応

## セットアップ手順

### 1. Amadeus APIキーを取得

1. https://developers.amadeus.com にアクセス
2. 無料アカウントを作成
3. 「My Self-Service Workspace」→「Create new app」でアプリを作成
4. 表示される **API Key** と **API Secret** をメモ

### 2. プロジェクトをセットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数ファイルを作成
cp .env.local.example .env.local
```

### 3. 環境変数を設定

`.env.local` を編集して、取得したAPIキーを設定：

```
AMADEUS_API_KEY=あなたのAPIキー
AMADEUS_API_SECRET=あなたのAPIシークレット
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 にアクセスして利用開始。

## プロジェクト構成

```
src/
├── app/
│   ├── api/search/route.ts   # フライト検索APIルート
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # メインページ
├── components/
│   ├── SearchForm.tsx         # 検索フォーム
│   └── FlightResults.tsx      # 検索結果（テーブル+カード）
└── lib/
    ├── amadeus.ts             # Amadeus API クライアント（OAuth2認証+キャッシュ）
    ├── airlines.ts            # 航空会社の日本語名マッピング
    └── types.ts               # TypeScript型定義
```

## 注意事項

- テスト環境のAPIを使用しているため、実際のリアルタイムデータとは異なる場合があります
- テスト環境のAPI呼び出しにはレート制限があります（月間リクエスト数に上限あり）
- 本番利用には Production 環境への移行が必要です
