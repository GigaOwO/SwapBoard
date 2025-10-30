# SwapBoard - タスク管理ツール

ドラッグ＆ドロップでタスクを「Todo / Doing / Done」間で移動できるタスク管理ツール。@dnd-kitで実装した本格的なカンバンボードです。

## 技術スタック

- **フロントエンド**: Next.js, @dnd-kit, TypeScript, Tailwind CSS
- **バックエンド**: Hono, Zod, Prisma
- **データベース**: Supabase (PostgreSQL) + Prisma ORM
- **認証**: Supabase Auth（将来の拡張用）

## 主な機能

- ✅ タスクの作成・編集・削除
- ✅ ドラッグ＆ドロップでタスクの状態を変更（Todo → Doing → Done）
- ✅ カラム間でのスムーズなタスク移動
- ✅ ドラッグ中のビジュアルフィードバック
- ✅ リアルタイムでのタスク位置の永続化
- ✅ レスポンシブデザイン
- ✅ ダークモード対応

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd SwapBoard
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. データベース接続情報を取得

### 4. 環境変数の設定

`.env.example`を`.env`にコピーして、Supabaseの接続情報を設定します：

```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下の値を設定：

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 5. データベースのマイグレーション

```bash
npx prisma migrate dev --name init
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
SwapBoard/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Hono)
│   ├── layout.tsx
│   └── page.tsx
├── features/              # 機能別ディレクトリ
│   └── task/
│       ├── components/    # Reactコンポーネント
│       ├── hooks/         # カスタムフック
│       ├── services/      # データアクセス層
│       ├── types/         # 型定義
│       └── constants/     # 定数
├── lib/                   # 共通ライブラリ
│   └── prisma.ts         # Prismaクライアント
├── prisma/
│   └── schema.prisma     # データベーススキーマ
└── utils/
    └── supabase/         # Supabase設定
```

## API エンドポイント

| メソッド | エンドポイント         | 機能                    |
| -------- | ---------------------- | ----------------------- |
| GET      | `/api/tasks`           | タスク一覧取得          |
| POST     | `/api/tasks`           | 新規タスク作成          |
| PUT      | `/api/tasks/:id`       | タスク更新              |
| DELETE   | `/api/tasks/:id`       | タスク削除              |
| POST     | `/api/tasks/positions` | タスク並び順一括更新    |

## スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番ビルド
- `npm run start` - 本番サーバー起動
- `npm run lint` - コードチェック（Biome）
- `npm run format` - コードフォーマット（Biome）

## 使い方

1. **タスクの追加**: 各列の「+ タスクを追加」ボタンをクリック
2. **タスクの移動**: タスクカードをドラッグ＆ドロップで他の列に移動
3. **タスクの削除**: タスクカード右上のゴミ箱アイコンをクリック

## 今後の拡張予定

- [ ] ユーザー認証機能の追加
- [ ] タスクの詳細情報（説明、期限、タグなど）
- [ ] リアルタイム同期（Supabase Realtime）
- [ ] タスクの検索・フィルタリング
- [ ] AIによるタスク分類・優先度提案

## ライセンス

MIT
