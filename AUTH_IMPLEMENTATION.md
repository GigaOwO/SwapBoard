# 認証機能の実装完了

## 概要

Supabase Authを使用した認証機能を実装しました。ログイン、サインアップ、ログアウト機能が利用可能になり、各ユーザーが自分のタスクのみを管理できるようになりました。

## 実装内容

### 1. 認証機能のディレクトリ構造

```
features/auth/
├── components/
│   ├── AuthGuard.tsx       # 認証ガードコンポーネント
│   ├── LoginForm.tsx       # ログインフォーム
│   ├── SignupForm.tsx      # サインアップフォーム
│   ├── LogoutButton.tsx    # ログアウトボタン
│   └── index.ts
├── hooks/
│   ├── useAuth.ts         # 認証管理フック
│   └── index.ts
├── services/
│   ├── authService.ts     # 認証サービス
│   └── index.ts
├── types/
│   ├── auth.ts           # 認証関連の型定義
│   └── index.ts
├── utils/
│   └── authMiddleware.ts # Hono用認証ミドルウェア
└── index.ts
```

### 2. 主な機能

#### 認証サービス (`authService.ts`)
- `login()` - メールアドレスとパスワードでログイン
- `signup()` - 新規ユーザー登録
- `logout()` - ログアウト
- `getCurrentUser()` - 現在のユーザー情報取得
- `getSession()` - セッション情報取得
- `onAuthStateChange()` - 認証状態変更の監視

#### カスタムフック (`useAuth.ts`)
- ユーザー状態の管理
- ログイン/サインアップ/ログアウトの実行
- エラーハンドリング
- ローディング状態の管理

#### UIコンポーネント
- **LoginForm** - ログインフォーム（バリデーション付き）
- **SignupForm** - サインアップフォーム（バリデーション付き）
- **LogoutButton** - ログアウトボタン
- **AuthGuard** - 認証が必要なページを保護

### 3. ミドルウェア

#### Next.jsミドルウェア (`middleware.ts`)
- 未認証ユーザーをログインページにリダイレクト
- ログイン済みユーザーが認証ページにアクセスした場合、ホームにリダイレクト
- Supabaseセッションの更新

#### Honoミドルウェア (`authMiddleware.ts`)
- APIリクエストの認証チェック
- ユーザー情報をコンテキストに保存
- 未認証の場合は401エラーを返す

### 4. API保護

すべてのタスク関連APIエンドポイントに認証を適用:
- `GET /api/tasks` - ログイン中のユーザーのタスクのみ取得
- `POST /api/tasks` - タスク作成時にuserIdを自動設定
- `PUT /api/tasks/:id` - 自分のタスクのみ更新可能
- `DELETE /api/tasks/:id` - 自分のタスクのみ削除可能

### 5. データベース

Prismaスキーマにて、`Task`モデルに`userId`フィールドを追加済み（既存のスキーマで対応済み）。

### 6. ページ

- `/login` - ログインページ
- `/signup` - サインアップページ
- `/` - メインページ（認証必須、ヘッダーにユーザー情報とログアウトボタンを表示）

## 使用方法

### 1. 環境変数の設定

`.env.local`に以下の環境変数が設定されていることを確認:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-database-url
```

### 2. アプリケーションの起動

```bash
npm run dev
```

### 3. ユーザー登録とログイン

1. `http://localhost:3000/signup` にアクセスして新規登録
2. メールアドレスとパスワードを入力
3. 登録後、自動的にログイン状態になりホームページへリダイレクト
4. タスクの作成・編集・削除が可能

### 4. ログアウト

ヘッダーの「ログアウト」ボタンをクリック

## セキュリティ機能

1. **パスワードのバリデーション** - 最低6文字以上
2. **メールアドレスのバリデーション** - Zodによる厳密なチェック
3. **APIの認証保護** - すべてのタスクAPIが認証必須
4. **ユーザー分離** - ユーザーは自分のタスクのみアクセス可能
5. **セッション管理** - Supabaseによる安全なセッション管理

## 型安全性

- Zodによるバリデーションスキーマ
- TypeScriptによる完全な型定義
- Honoのコンテキストに型を追加してuserIdの安全なアクセス

## 次のステップ

- [ ] パスワードリセット機能の追加
- [ ] メール認証の有効化
- [ ] OAuth（Google、GitHubなど）の統合
- [ ] ユーザープロフィール編集機能
- [ ] セッションタイムアウトの設定
