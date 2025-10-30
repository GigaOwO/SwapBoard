"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Supabaseクライアントを初期化するコンポーネント
 * アプリケーションの起動時に一度だけ実行される
 */
export function SupabaseInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .then(() => {
        setIsInitialized(true);
      })
      .catch((err) => {
        console.error("Failed to initialize Supabase:", err);
        setError("認証システムの初期化に失敗しました。");
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
