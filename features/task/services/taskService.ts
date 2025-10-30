import { prisma } from "@/lib/prisma";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../types";

/**
 * タスク一覧を取得
 * @param userId - ユーザーID（オプション）
 * @returns タスク一覧
 */
export async function getTasks(userId?: string): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    where: userId ? { userId } : {},
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
  return tasks as Task[];
}

/**
 * タスクをIDで取得
 * @param id - タスクID
 * @param userId - ユーザーID（オプション）
 * @returns タスク
 */
export async function getTaskById(id: string, userId?: string): Promise<Task | null> {
  const task = await prisma.task.findFirst({
    where: userId ? { id, userId } : { id },
  });
  return task as Task | null;
}

/**
 * タスクを作成
 * @param data - タスク作成データ
 * @returns 作成されたタスク
 */
export async function createTask(data: CreateTaskInput & { userId?: string }): Promise<Task> {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      status: data.status,
      position: data.position,
      userId: data.userId,
    },
  });
  return task as Task;
}

/**
 * タスクを更新
 * @param id - タスクID
 * @param data - タスク更新データ
 * @returns 更新されたタスク
 */
export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<Task> {
  const task = await prisma.task.update({
    where: { id },
    data,
  });
  return task as Task;
}

/**
 * タスクを削除
 * @param id - タスクID
 * @returns 削除されたタスク
 */
export async function deleteTask(id: string): Promise<Task> {
  const task = await prisma.task.delete({
    where: { id },
  });
  return task as Task;
}

/**
 * タスクの並び順を一括更新
 * @param updates - 更新データの配列 { id, status, position }
 */
export async function updateTaskPositions(
  updates: Array<{ id: string; status: string; position: number }>
): Promise<void> {
  await prisma.$transaction(
    updates.map((update) =>
      prisma.task.update({
        where: { id: update.id },
        data: {
          status: update.status,
          position: update.position,
        },
      })
    )
  );
}
