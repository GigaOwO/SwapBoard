"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  onAuthStateChange,
  signup as signupService,
} from "../services";
import type { AuthState, LoginInput, SignupInput } from "../types";

/**
 * 認証管理用カスタムフック
 * @returns 認証状態とログイン・ログアウト機能を提供
 */
export function useAuth() {
  const router = useRouter();
  const mountedRef = useRef(true);
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  /**
   * ユーザー情報を取得
   */
  const fetchUser = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await getCurrentUser();

      if (!mountedRef.current) return;

      setState({ user, loading: false, error: null });
    } catch (error) {
      if (!mountedRef.current) return;

      setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch user",
      });
    }
  }, []);

  /**
   * ログイン
   */
  const login = useCallback(
    async (data: LoginInput) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const user = await loginService(data);
        setState({ user, loading: false, error: null });
        // ログイン成功後、ホームページにリダイレクト
        router.push("/");
        return user;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to login";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [router],
  );

  /**
   * サインアップ
   */
  const signup = useCallback(
    async (data: SignupInput) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const user = await signupService(data);
        setState({ user, loading: false, error: null });
        // サインアップ成功後、ホームページにリダイレクト
        router.push("/");
        return user;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to signup";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [router],
  );

  /**
   * ログアウト
   */
  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await logoutService();
      setState({ user: null, loading: false, error: null });
      // ログアウト後、ログインページにリダイレクト
      router.push("/login");
    } catch (error) {
      // エラーがあってもユーザーをnullに設定
      setState({ user: null, loading: false, error: null });
      console.error("Logout error in useAuth:", error);
      // エラーがあってもログインページにリダイレクト
      router.push("/login");
    }
  }, [router]);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 初回マウント時にユーザー情報を取得
  useEffect(() => {
    mountedRef.current = true;
    fetchUser();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchUser]);

  // 認証状態の変更を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setState((prev) => ({ ...prev, user }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    logout,
    clearError,
  };
}
