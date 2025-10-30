import { createServerClient } from "@supabase/ssr";
import type { Context, Next } from "hono";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Hono用の認証ミドルウェア
 * リクエストヘッダーからユーザー情報を取得し、コンテキストに保存する
 */
export async function authMiddleware(c: Context, next: Next) {
  // Cookieの取得と設定を行うヘルパー
  const cookies = {
    getAll: () => {
      const cookieHeader = c.req.header("cookie");
      if (!cookieHeader) return [];
      
      return cookieHeader.split(";").map((cookie) => {
        const [name, ...valueParts] = cookie.trim().split("=");
        return {
          name,
          value: valueParts.join("="),
        };
      });
    },
    setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
      // Honoでは直接レスポンスヘッダーに設定
      cookiesToSet.forEach(({ name, value, options }) => {
        let cookieValue = `${name}=${value}`;
        if (options?.maxAge) cookieValue += `; Max-Age=${options.maxAge}`;
        if (options?.path) cookieValue += `; Path=${options.path}`;
        if (options?.domain) cookieValue += `; Domain=${options.domain}`;
        if (options?.secure) cookieValue += "; Secure";
        if (options?.httpOnly) cookieValue += "; HttpOnly";
        if (options?.sameSite) cookieValue += `; SameSite=${options.sameSite}`;
        
        c.header("Set-Cookie", cookieValue, { append: true });
      });
    },
  };

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies,
    },
  );

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // リフレッシュトークンエラーまたは認証エラーの場合
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // ユーザー情報をコンテキストに保存
    c.set("user", user);
    c.set("userId", user.id);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: "Unauthorized" }, 401);
  }
}
