import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Anon Key are required");
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // セッションをリフレッシュしてから取得
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // リフレッシュトークンエラーの場合はセッションをクリア
    if (
      error?.message?.includes("refresh_token_not_found") ||
      error?.status === 400
    ) {
      // すべての認証関連Cookieをクリア
      supabaseResponse.cookies.delete("sb-access-token");
      supabaseResponse.cookies.delete("sb-refresh-token");

      // Supabase SRRの新しいCookie名もクリア
      const allCookies = request.cookies.getAll();
      allCookies.forEach((cookie) => {
        if (
          cookie.name.startsWith("sb-") ||
          cookie.name.includes("auth-token")
        ) {
          supabaseResponse.cookies.delete(cookie.name);
        }
      });

      return { response: supabaseResponse, user: null };
    }

    return { response: supabaseResponse, user };
  } catch (error) {
    console.error("Auth error:", error);
    return { response: supabaseResponse, user: null };
  }
};
