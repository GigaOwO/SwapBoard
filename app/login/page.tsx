"use client";

import { LoginForm } from "@/features/auth";
import Link from "next/link";

/**
 * ログインページ
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            SwapBoard
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            タスク管理アプリケーション
          </p>
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
