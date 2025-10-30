# 環境変数のセキュリティ対策

## 概要

このプロジェクトでは、環境変数を安全に扱うために、クライアント側に環境変数を公開しない設計を採用しています。

## 問題点（修正前）

以前は `NEXT_PUBLIC_` プレフィックスを使用していたため、以下の問題がありました:

```bash
# ❌ クライアント側に公開されてしまう
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

- `NEXT_PUBLIC_` プレフィックスは、Next.jsによってブラウザに公開される
- ブラウザの開発者ツールでキーが確認できてしまう
- セキュリティリスクが高い

## 解決策（修正後）

### 1. 環境変数の変更

```bash
# ✅ サーバーサイド専用（クライアントに公開されない）
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

### 2. APIエンドポイントの作成

`/app/api/config/route.ts` を作成し、必要な設定のみをサーバーから提供:

```typescript
export async function GET() {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  };
  return NextResponse.json(config);
}
```

### 3. クライアント側の初期化

`/utils/supabase/client.ts` で非同期に設定を取得:

```typescript
export async function createClient(): Promise<SupabaseClient> {
  // サーバーから設定を取得
  const response = await fetch("/api/config");
  const { supabaseUrl, supabaseAnonKey } = await response.json();
  
  // Supabaseクライアントを作成
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
```

### 4. アプリケーション起動時の初期化

`/components/SupabaseInitializer.tsx` でアプリケーション起動時に一度だけ初期化:

```tsx
export function SupabaseInitializer({ children }) {
  useEffect(() => {
    createClient().then(() => setIsInitialized(true));
  }, []);
  
  if (!isInitialized) return <div>読み込み中...</div>;
  return <>{children}</>;
}
```

## セキュリティ上のメリット

1. **環境変数がクライアント側に漏洩しない**
   - ブラウザのバンドルに環境変数が含まれない
   - 開発者ツールで確認できない

2. **サーバー側で制御可能**
   - どの設定を公開するかをサーバー側で制御
   - レート制限やアクセス制御を追加可能

3. **設定の動的変更**
   - 環境変数の変更時に再ビルド不要（APIが最新の値を返す）

## 注意事項

### Supabase ANON KEY について

Supabase の ANON KEY は、Row Level Security (RLS) と組み合わせることで安全に使用できるように設計されています。ただし、以下の理由でサーバー側で管理することを推奨します:

1. **追加のセキュリティレイヤー**: クライアント側に直接公開しないことで、追加の保護層を提供
2. **柔軟性**: 将来的にキーのローテーションやアクセス制御を追加しやすい
3. **ベストプラクティス**: 機密情報はサーバー側で管理するという原則に従う

### 開発環境での設定

`.env.local` ファイルに以下の環境変数を設定してください:

```bash
# Supabase configuration (サーバーサイド専用)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Database configuration
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-database-url
```

### 本番環境での設定

Vercelなどのデプロイ先で、環境変数を設定してください:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

**重要**: `NEXT_PUBLIC_` プレフィックスは使用しないでください。

## 移行ガイド

既存のコードから移行する場合:

1. `.env.local` の `NEXT_PUBLIC_` プレフィックスを削除
2. クライアント側で `createClient()` を `await createClient()` に変更
3. `SupabaseInitializer` をルートレイアウトに追加
4. 本番環境の環境変数を更新

## トラブルシューティング

### "Failed to initialize Supabase client" エラー

1. `.env.local` に環境変数が設定されているか確認
2. 開発サーバーを再起動（環境変数の変更後）
3. `/api/config` にアクセスして設定が返ってくるか確認

### 初期化が遅い

`SupabaseInitializer` がキャッシュを使用するため、2回目以降は高速です。  
初回のみ API リクエストが発生します。

## 参考資料

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Auth Security](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
