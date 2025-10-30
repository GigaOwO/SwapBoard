"use client";

import { memo, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../types";
import { TASK_STATUS_COLORS, type TaskStatus } from "../constants";

/**
 * タスクカードコンポーネント
 */
interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  isDragging?: boolean;
  status?: TaskStatus;
}

function TaskCardComponent({ task, onDelete, onUpdate, isDragging = false, status }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: isActiveDrag } = useDraggable({
    id: task.id,
    disabled: isDragging, // DragOverlay内では無効化
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const colors = status ? TASK_STATUS_COLORS[status] : null;
  const cardColorClass = colors 
    ? colors.card 
    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  }, [onDelete, task.id]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg shadow-sm border-2 p-4 cursor-grab active:cursor-grabbing transition-opacity ${cardColorClass} ${
        isActiveDrag && !isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-black flex-1">
          {task.title}
        </h3>
        <button
          onClick={handleDelete}
          className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          aria-label="タスクを削除"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {new Date(task.createdAt).toLocaleDateString("ja-JP")}
      </div>
    </div>
  );
}

/**
 * メモ化されたタスクカード
 * propsが変更されない限り再レンダリングされない
 */
export const TaskCard = memo(TaskCardComponent);
