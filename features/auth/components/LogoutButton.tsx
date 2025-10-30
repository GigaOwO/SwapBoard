"use client";

import { useAuth } from "../hooks";

/**
 * ログアウトボタンコンポーネント
 */
export function LogoutButton() {
  const { logout, loading } = useAuth();

  /**
   * ログアウト処理
   */
  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
