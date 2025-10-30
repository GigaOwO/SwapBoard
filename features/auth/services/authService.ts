"use client";

import { clearAuthState } from "@/utils/supabase/clearAuth";
import { createClient } from "@/utils/supabase/client";
import type { LoginInput, SignupInput, User } from "../types";

/**
 * メールアドレスとパスワードでログイン
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns ユーザー情報またはnull
 */
export async function login(data: LoginInput): Promise<User | null> {
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!authData.user || !authData.user.email) {
    return null;
  }

  return {
    id: authData.user.id,
    email: authData.user.email,
    createdAt: new Date(authData.user.created_at),
  };
}

/**
 * 新規ユーザー登録
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns ユーザー情報またはnull
 */
export async function signup(data: SignupInput): Promise<User | null> {
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!authData.user || !authData.user.email) {
    return null;
  }

  return {
    id: authData.user.id,
    email: authData.user.email,
    createdAt: new Date(authData.user.created_at),
  };
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // エラーの有無にかかわらず、ローカルの認証状態をクリア
    clearAuthState();
  }
}

/**
 * 現在のユーザー情報を取得
 * @returns ユーザー情報またはnull
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // リフレッシュトークンエラーの場合はnullを返す
    if (
      error?.message?.includes("refresh_token_not_found") ||
      error?.status === 400
    ) {
      // セッションをクリア
      clearAuthState();
      await supabase.auth.signOut();
      return null;
    }

    if (error) {
      console.error("Get user error:", error);
      return null;
    }

    if (!user || !user.email) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: new Date(user.created_at),
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

/**
 * セッションを取得
 * @returns セッション情報またはnull
 */
export async function getSession() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * 認証状態の変更を監視
 * @param callback - 認証状態が変更されたときに実行するコールバック
 */
export async function onAuthStateChange(
  callback: (user: User | null) => void,
): Promise<() => void> {
  const supabase = await createClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.email) {
      callback({
        id: session.user.id,
        email: session.user.email,
        createdAt: new Date(session.user.created_at),
      });
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
