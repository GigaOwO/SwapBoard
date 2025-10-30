import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * クライアント側でSupabaseクライアントを作成
 * 環境変数を直接参照せず、サーバーから設定を取得
 */
export async function createClient(): Promise<SupabaseClient> {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    // サーバーから設定を取得
    const response = await fetch("/api/config");
    if (!response.ok) {
      throw new Error("Failed to fetch Supabase config");
    }

    const { supabaseUrl, supabaseAnonKey } = await response.json();

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Anon Key are required");
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    throw new Error("Failed to initialize Supabase client");
  }
}

/**
 * 既存のクライアントを取得（初期化済みの場合）
 * 未初期化の場合はエラーをスロー
 */
export function getClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error("Supabase client not initialized. Call createClient() first.");
  }
  return supabaseClient;
}

