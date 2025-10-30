# 環境変数セキュリティ対策 - 変更内容まとめ

## 変更日時
2025年10月30日

## 変更の概要
クライアント側に環境変数が漏洩する問題を解決するため、`NEXT_PUBLIC_` プレフィックスを削除し、サーバー側で環境変数を管理する設計に変更しました。

## 変更したファイル

### 1. 環境変数ファイル
- **ファイル**: `.env.local`
- **変更内容**: 
  - `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `SUPABASE_ANON_KEY`

### 2. サーバーサイドファイル

#### `/utils/supabase/server.ts`
```typescript
// 変更前
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 変更後
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
```

#### `/utils/supabase/middleware.ts`
```typescript
// 変更前
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 変更後
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
```

#### `/features/auth/utils/authMiddleware.ts`
```typescript
// 変更前
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 変更後
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
```

### 3. クライアントサイドファイル

#### `/utils/supabase/client.ts`
```typescript
// 変更前
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createBrowserClient(supabaseUrl, supabaseKey);
};

// 変更後
export async function createClient(): Promise<SupabaseClient> {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // サーバーから設定を取得
  const response = await fetch("/api/config");
  const { supabaseUrl, supabaseAnonKey } = await response.json();
  
  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}
```

#### `/features/auth/services/authService.ts`
全ての関数で `createClient()` を `await createClient()` に変更:
- `login()`
- `signup()`
- `logout()`
- `getCurrentUser()`
- `getSession()`
- `onAuthStateChange()` → 戻り値の型も `Promise<() => void>` に変更

#### `/features/auth/hooks/useAuth.ts`
```typescript
// 変更前
useEffect(() => {
  const unsubscribe = onAuthStateChange((user) => {
    setState((prev) => ({ ...prev, user }));
  });
  return () => unsubscribe();
}, []);

// 変更後
useEffect(() => {
  let unsubscribe: (() => void) | undefined;
  onAuthStateChange((user) => {
    setState((prev) => ({ ...prev, user }));
  }).then((unsub) => {
    unsubscribe = unsub;
  });
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);
```

### 4. 新規作成ファイル

#### `/app/api/config/route.ts`
サーバーから安全に設定を提供するAPIエンドポイント:
- `GET /api/config` で Supabase 設定を返す
- キャッシュヘッダーを設定して効率化

#### `/lib/supabaseConfig.ts`
Supabase設定を管理するユーティリティ:
- `getSupabaseConfig()`: 設定を取得（キャッシュ付き）
- `preloadSupabaseConfig()`: SSR時に設定を事前ロード

#### `/components/SupabaseInitializer.tsx`
アプリケーション起動時にSupabaseクライアントを初期化:
- 起動時に一度だけ `createClient()` を実行
- 初期化完了まで読み込み画面を表示
- エラーハンドリング

#### `/app/layout.tsx`
ルートレイアウトに `SupabaseInitializer` を追加:
```tsx
<SupabaseInitializer>{children}</SupabaseInitializer>
```

#### `/SECURITY.md`
セキュリティ対策の詳細ドキュメント

## セキュリティ上の改善点

### Before（修正前）
```
ブラウザ → NEXT_PUBLIC_* 環境変数を直接参照
         ↓
      バンドルに含まれる
         ↓
   開発者ツールで確認可能 ⚠️
```

### After（修正後）
```
ブラウザ → /api/config にリクエスト
         ↓
   Next.jsサーバー → process.env.* を参照
         ↓
      必要な設定のみを返す
         ↓
   ブラウザ側でキャッシュ ✅
```

## 影響範囲

### 既存コードへの影響
1. **非同期処理の追加**: `createClient()` が非同期になったため、`await` が必要
2. **初期化タイミング**: アプリケーション起動時に初期化が必要
3. **型の変更**: `onAuthStateChange()` の戻り値が `Promise<() => void>` に

### 動作への影響
1. **初回起動が若干遅くなる**: API リクエストが発生するため（キャッシュされれば高速）
2. **サーバーへの依存**: サーバーが起動していないとクライアントが初期化できない
3. **セキュリティの向上**: 環境変数がクライアント側に漏洩しない

## 移行手順

1. `.env.local` を更新
2. 開発サーバーを再起動: `npm run dev`
3. ブラウザをリフレッシュ
4. 動作確認:
   - ログイン/ログアウト
   - タスクの CRUD 操作
   - 認証状態の永続化

## テスト項目

- [ ] ログイン機能
- [ ] サインアップ機能
- [ ] ログアウト機能
- [ ] 認証状態の永続化
- [ ] タスクの作成・取得・更新・削除
- [ ] ページリロード後の認証状態
- [ ] ブラウザの開発者ツールで環境変数が見えないことを確認

## 本番環境での設定

Vercel等のデプロイ先で以下の環境変数を設定:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-database-url
```

**注意**: `NEXT_PUBLIC_` プレフィックスは使用しないこと！

## ロールバック方法

万が一問題が発生した場合:

1. `.env.local` を元に戻す（`NEXT_PUBLIC_` プレフィックスを追加）
2. 変更したファイルをGitで元に戻す
3. 開発サーバーを再起動

## 参考資料

- `/SECURITY.md`: セキュリティ対策の詳細
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
- Supabase Auth Helpers: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
