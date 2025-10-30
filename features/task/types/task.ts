import { z } from "zod";
import { TASK_STATUS, type TaskStatus } from "../constants";

/**
 * タスク作成時のバリデーションスキーマ
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, "タイトルは200文字以内で入力してください"),
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.DOING, TASK_STATUS.DONE])
    .default(TASK_STATUS.TODO),
  position: z.number().int().nonnegative().default(0),
});

/**
 * タスク更新時のバリデーションスキーマ
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, "タイトルは200文字以内で入力してください")
    .optional(),
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.DOING, TASK_STATUS.DONE])
    .optional(),
  position: z.number().int().nonnegative().optional(),
});

/**
 * タスク作成時の入力型
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * タスク更新時の入力型
 */
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * タスクの型定義
 */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  position: number;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
