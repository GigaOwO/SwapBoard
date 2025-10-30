"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Task } from "../types";
import type { TaskStatus } from "../constants";

/**
 * タスク管理用カスタムフック
 * @returns タスクの取得、作成、更新、削除、並び替え機能を提供
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  /**
   * タスク一覧を取得
   */
  const fetchTasks = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      
      // コンポーネントがアンマウントされている場合は状態を更新しない
      if (!mountedRef.current) return;
      
      // 日付文字列をDateオブジェクトに変換
      const tasksWithDates = data.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      setTasks(tasksWithDates);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (showLoading && mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * タスクを作成
   */
  const createTask = useCallback(
    async (title: string, status: string = "todo") => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, status, position: 0 }),
        });
        if (!response.ok) {
          throw new Error("Failed to create task");
        }
        const newTask = await response.json();
        // 日付文字列をDateオブジェクトに変換
        const taskWithDates = {
          ...newTask,
          createdAt: new Date(newTask.createdAt),
          updatedAt: new Date(newTask.updatedAt),
        };
        // 楽観的UI更新: サーバーから返されたタスクを即座にステートに追加
        setTasks((prev) => [...prev, taskWithDates]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // エラーが発生した場合のみ再フェッチ
        await fetchTasks(false);
      }
    },
    [fetchTasks]
  );

  /**
   * タスクを更新
   */
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      // 楽観的UI更新: 先にUIを更新
      setTasks((prev) =>
        prev.map((task) => 
          task.id === id 
            ? { ...task, ...updates, updatedAt: new Date() } 
            : task
        )
      );

      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!response.ok) {
          throw new Error("Failed to update task");
        }
        const updatedTask = await response.json();
        // サーバーからの正式なレスポンスで更新
        const taskWithDates = {
          ...updatedTask,
          createdAt: new Date(updatedTask.createdAt),
          updatedAt: new Date(updatedTask.updatedAt),
        };
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? taskWithDates : task))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // エラーが発生した場合のみ再フェッチして正しい状態に戻す
        await fetchTasks(false);
      }
    },
    [fetchTasks]
  );

  /**
   * タスクを削除
   */
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete task");
        }
        // 楽観的UI更新: 削除したタスクをステートから除外
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // エラーが発生した場合のみ再フェッチ
        await fetchTasks(false);
      }
    },
    [fetchTasks]
  );

  /**
   * タスクの並び順を一括更新
   */
  const updateTaskPositions = useCallback(
    async (updates: Array<{ id: string; status: TaskStatus; position: number }>) => {
      // 楽観的UI更新: 先にUIを更新
      const updatesMap = new Map(updates.map((u) => [u.id, u]));
      setTasks((prev) =>
        prev.map((task) => {
          const update = updatesMap.get(task.id);
          return update
            ? { ...task, status: update.status, position: update.position }
            : task;
        })
      );

      try {
        const response = await fetch("/api/tasks/positions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });
        if (!response.ok) {
          throw new Error("Failed to update task positions");
          // エラー時は元に戻す
          await fetchTasks(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // エラーが発生した場合は再フェッチして正しい状態に戻す
        await fetchTasks(false);
      }
    },
    [fetchTasks]
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchTasks();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskPositions,
  };
}
