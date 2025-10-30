"use client";

import { useDroppable } from "@dnd-kit/core";
import { memo, useCallback } from "react";
import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  type TaskStatus,
} from "../constants";
import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

/**
 * タスク列コンポーネント
 */
interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onAddTask: (status: string) => void;
}

function TaskColumnComponent({
  status,
  tasks,
  onDelete,
  onUpdate,
  onAddTask,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
  });

  const colors = TASK_STATUS_COLORS[status];

  const handleAddTask = useCallback(() => {
    onAddTask(status);
  }, [onAddTask, status]);

  return (
    <div className="flex-1 min-w-[280px]">
      <div className={`rounded-lg p-4 ${colors.bg} ${colors.border} border-2`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold ${colors.text}`}>
            {TASK_STATUS_LABELS[status]}
          </h2>
          <span className={`text-sm ${colors.text}`}>{tasks.length}</span>
        </div>

        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
            isOver ? "bg-white/80 border-2 border-dashed" : ""
          } ${isOver ? colors.border : ""}`}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
                onUpdate={onUpdate}
                status={status}
              />
            ))
          ) : (
            <div
              className={`min-h-[100px] border-2 border-dashed rounded-lg flex items-center justify-center text-sm ${colors.border} ${colors.text} opacity-60`}
            >
              タスクなし
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddTask}
          className={`w-full mt-3 py-2 px-4 text-sm rounded-lg transition-colors border-2 border-dashed ${colors.border} ${colors.text} hover:bg-white/80`}
        >
          + タスクを追加
        </button>
      </div>
    </div>
  );
}

/**
 * メモ化されたタスク列
 * propsが変更されない限り再レンダリングされない
 */
export const TaskColumn = memo(TaskColumnComponent);
