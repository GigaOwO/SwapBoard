"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import { TASK_STATUSES, type TaskStatus } from "../constants";
import { useTasks } from "../hooks";
import type { Task } from "../types";
import { TaskCard } from "./TaskCard";
import { TaskColumn } from "./TaskColumn";

/**
 * タスクボードコンポーネント
 * @dnd-kitを使用してドラッグ&ドロップ機能を提供
 */
export function TaskBoard() {
  const { tasks, loading, error, createTask, deleteTask, updateTask } =
    useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  /**
   * ドラッグセンサーの設定
   * ポインターが5px以上動いたらドラッグ開始
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  /**
   * ドラッグ開始時の処理
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks.find((t) => t.id === active.id);
      if (task) {
        setActiveTask(task);
      }
    },
    [tasks],
  );

  /**
   * ドラッグオーバー時の処理（カラム間移動のプレビュー）
   */
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // カラムの上にドラッグした場合
      if (overId.startsWith("column-")) {
        const newStatus = overId.replace("column-", "") as TaskStatus;
        const task = tasks.find((t) => t.id === activeId);

        if (task && task.status !== newStatus) {
          // 楽観的更新（実際のDB更新はhandleDragEndで行う）
          setActiveTask({ ...task, status: newStatus });
        }
      }
    },
    [tasks],
  );

  /**
   * ドラッグ終了時の処理
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // カラムの上でドロップした場合
      if (overId.startsWith("column-")) {
        const newStatus = overId.replace("column-", "") as TaskStatus;
        const task = tasks.find((t) => t.id === taskId);

        if (task && task.status !== newStatus) {
          updateTask(taskId, { status: newStatus });
        }
      }
    },
    [tasks, updateTask],
  );

  /**
   * タスク追加ハンドラー
   */
  const handleAddTask = useCallback((status: string) => {
    setActiveStatus(status);
  }, []);

  /**
   * タスク作成送信
   */
  const handleSubmitTask = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle.trim() || !activeStatus) return;

      await createTask(newTaskTitle, activeStatus);
      setNewTaskTitle("");
      setActiveStatus(null);
    },
    [newTaskTitle, activeStatus, createTask],
  );

  /**
   * ステータス別にタスクをグループ化（メモ化）
   */
  const tasksByStatus = useMemo(() => {
    const grouped = {
      todo: [] as Task[],
      doing: [] as Task[],
      done: [] as Task[],
    };

    for (const task of tasks) {
      if (task.status in grouped) {
        grouped[task.status as keyof typeof grouped].push(task);
      }
    }

    return grouped;
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {TASK_STATUSES.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onDelete={deleteTask}
                onUpdate={updateTask}
                onAddTask={handleAddTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80 rotate-3 cursor-grabbing">
                <TaskCard
                  task={activeTask}
                  onDelete={() => {}}
                  onUpdate={() => {}}
                  isDragging
                  status={activeTask.status}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* タスク追加モーダル */}
        {activeStatus && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                新しいタスクを追加
              </h2>
              <form onSubmit={handleSubmitTask}>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="タスク名を入力..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    追加
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStatus(null);
                      setNewTaskTitle("");
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 px-4 rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
