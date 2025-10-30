"use client";

import { useMemo } from "react";
import { TaskBoard } from "@/features/task";
import { LogoutButton, useAuth } from "@/features/auth";

export default function Home() {
  const { user } = useAuth();

  const userInfo = useMemo(() => {
    if (!user) return null;
    return (
      <>
        <span className="text-sm text-gray-600">{user.email}</span>
        <LogoutButton />
      </>
    );
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SwapBoard</h1>
          <div className="flex items-center gap-4">
            {userInfo}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskBoard />
      </main>
    </div>
  );
}
