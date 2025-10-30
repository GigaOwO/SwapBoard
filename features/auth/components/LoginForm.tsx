"use client";

import { useCallback, useState } from "react";
import { useAuth } from "../hooks";
import { loginSchema } from "../types";

/**
 * ログインフォームコンポーネント
 */
export function LoginForm() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  /**
   * フォーム送信処理
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationErrors({});

      // バリデーション
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: { email?: string; password?: string } = {};
        result.error.issues.forEach((err) => {
          if (err.path[0] === "email") {
            errors.email = err.message;
          } else if (err.path[0] === "password") {
            errors.password = err.message;
          }
        });
        setValidationErrors(errors);
        return;
      }

      try {
        await login({ email, password });
        // ログイン成功後の処理はuseAuthで管理
      } catch (err) {
        // エラーはuseAuthで管理
        console.error("Login error:", err);
      }
    },
    [email, password, login],
  );

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        ログイン
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* メールアドレス */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-black mb-1"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            disabled={loading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* パスワード */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-black mb-1"
          >
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            disabled={loading}
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
