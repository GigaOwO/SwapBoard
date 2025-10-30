import { NextResponse } from "next/server";

/**
 * クライアント側で使用する公開設定を返すAPI
 * 環境変数をブラウザに直接公開せず、サーバー側で制御
 */
export async function GET() {
  // サーバーサイドの環境変数から必要な情報のみを返す
  const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  };

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase configuration is not set" },
      { status: 500 }
    );
  }

  return NextResponse.json(config, {
    headers: {
      // キャッシュを有効にして、毎回のリクエストを防ぐ
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
