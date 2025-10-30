/**
 * Supabase設定を管理するモジュール
 * クライアント側で環境変数を直接参照せず、サーバーから安全に取得
 */

type SupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

let cachedConfig: SupabaseConfig | null = null;

/**
 * Supabase設定を取得する
 * 初回のみサーバーAPIから取得し、以降はキャッシュを使用
 */
export async function getSupabaseConfig(): Promise<SupabaseConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch("/api/config");
    if (!response.ok) {
      throw new Error("Failed to fetch Supabase config");
    }

    const config = await response.json();
    cachedConfig = config;
    return config;
  } catch (error) {
    console.error("Error fetching Supabase config:", error);
    throw new Error("Failed to initialize Supabase configuration");
  }
}

/**
 * サーバーサイドレンダリング時に設定を事前ロード
 * クライアント側で初回レンダリング時に設定が利用可能になる
 */
export function preloadSupabaseConfig(config: SupabaseConfig): void {
  cachedConfig = config;
}
