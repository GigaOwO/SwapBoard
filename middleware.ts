import { updateSession } from "@/utils/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.jsミドルウェア
 * 認証が必要なルートを保護する
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // 認証ページへのアクセス
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")
  ) {
    // すでにログインしている場合はホームへリダイレクト
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // 保護されたルートへのアクセス
  if (!user) {
    // 未認証の場合はログインページへリダイレクト
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

/**
 * ミドルウェアを適用するパスの設定
 */
export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - public フォルダ内のファイル
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
