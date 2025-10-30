# TaskBoard (dnd-kit × Next.js × Hono × Supabase × Prisma)

## 概要

タスクボードアプリ。@dnd-kit を使って、ドラッグ＆ドロップでタスクを簡単に並び替えることができる。  
フロントエンドは **Next.js**、バックエンドは **Hono**、データベースと認証は **Supabase** を利用し、ORM として **Prisma** を導入して型安全なデータ操作を実現する。

---

## 目的

- ドラッグ＆ドロップ（@dnd-kit）の実践的な理解  
- Hono × Supabase を使った API 設計・認証  
- Prisma による型安全なデータ操作  
- TypeScript + Zod による厳密な型管理

---

## 技術スタック

| 分類           | 技術                                         |
| -------------- | -------------------------------------------- |
| フロントエンド | Next.js, @dnd-kit, TypeScript, Tailwind CSS  |
| バックエンド   | Hono, Zod, Prisma                            |
| データベース   | Supabase (PostgreSQL) + Prisma ORM           |
| 認証           | Supabase Auth                                |
| デプロイ       | Vercel                                       |

npmを使用すること
---

## 主な機能

- ユーザー認証（Supabase Auth）
- タスクの CRUD
- カンバン形式でのドラッグ＆ドロップ（Swapy）
- タスク状態（Todo, In Progress, Done）によるフィルタリング
- タスク並び替えの永続化
- Prisma による安全な DB アクセスとスキーマ管理

---

## ディレクトリ構成
これは例なので、featuresの中には他の機能も追加可能です。(例: auth など)
```
taskboard/
├── apps/
│   ├── web/             
│   │   ├── app/
│   │   │   └── api/
│   │   ├── features/
│   │   │   ├── task/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── usecases/
│   │   │   │   ├── types/
│   │   │   │   ├── constants/
│   │   │   │   ├── utils/
│   │   ├── types/
│   │   └── __tests__/
```

---

## API 設計（概要）

| メソッド | エンドポイント   | 機能           |
| -------- | ---------------- | -------------- |
| GET      | `/api/tasks`     | タスク一覧取得 |
| POST     | `/api/tasks`     | 新規タスク作成 |
| PUT      | `/api/tasks/:id` | タスク更新     |
| DELETE   | `/api/tasks/:id` | タスク削除     |

※ 認証が必要なエンドポイントには Hono Middleware で Supabase Auth を適用。  
※ Prisma で Supabase DB にアクセス。

---

- **Supabase の PostgreSQL** に Prisma を接続して利用。
- マイグレーションは `prisma migrate` で管理。

---

## バリデーション設計（概要）

Zod を使用して、型安全を保ちながらフロント・バック両方で共通利用する。
---

## コーディング規約・補足

- **JSDoc コメントを各関数・hooks に記述**

- **アロー関数ではなくfunctionで書くこと**



- **index.ts での export 整理**
  - import パスを短縮して可読性向上
  - 例：`import { TaskBoard } from "@/features/task"`

- **Swapy でのドラッグイベントの型安全化**
  - `onSwapStart` / `onSwapEnd` などのイベント型を定義して再利用

---

## 今後の拡張アイデア

- Supabase Functions によるリアルタイム同期  
- AI によるタスク分類・優先度提案  
- ダークモード / レスポンシブ対応  
- WebSocket（Hono + Server-Sent Events）でリアルタイム更新
