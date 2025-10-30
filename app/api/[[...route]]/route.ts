import type { User } from "@supabase/supabase-js";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { authMiddleware } from "@/features/auth/utils/authMiddleware";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskPositions,
} from "@/features/task/services";
import { createTaskSchema, updateTaskSchema } from "@/features/task/types";

export const runtime = "nodejs";

// Honoのコンテキストに型を追加
type Variables = {
  user: User;
  userId: string;
};

const app = new Hono<{ Variables: Variables }>().basePath("/api");

// 認証が必要なエンドポイントに認証ミドルウェアを適用
app.use("/tasks/*", authMiddleware);
app.use("/tasks", authMiddleware);

/**
 * タスク一覧取得
 */
app.get("/tasks", async (c) => {
  try {
    const userId = c.get("userId");
    const tasks = await getTasks(userId);
    return c.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return c.json({ error: "Failed to fetch tasks" }, 500);
  }
});

/**
 * タスク作成
 */
app.post("/tasks", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    // バリデーション
    const result = createTaskSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        { error: "Validation error", issues: result.error.issues },
        400,
      );
    }

    const task = await createTask({ ...result.data, userId });
    return c.json(task, 201);
  } catch (error) {
    console.error("Failed to create task:", error);
    return c.json({ error: "Failed to create task" }, 500);
  }
});

/**
 * タスク更新
 */
app.put("/tasks/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = await c.req.json();

    // バリデーション
    const result = updateTaskSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        { error: "Validation error", issues: result.error.issues },
        400,
      );
    }

    const existingTask = await getTaskById(id, userId);
    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }

    const task = await updateTask(id, result.data);
    return c.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return c.json({ error: "Failed to update task" }, 500);
  }
});

/**
 * タスク削除
 */
app.delete("/tasks/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    const existingTask = await getTaskById(id, userId);
    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }

    const task = await deleteTask(id);
    return c.json(task);
  } catch (error) {
    console.error("Failed to delete task:", error);
    return c.json({ error: "Failed to delete task" }, 500);
  }
});

/**
 * タスクの並び順を一括更新
 */
const updatePositionsSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      position: z.number(),
    }),
  ),
});

app.post("/tasks/positions", async (c) => {
  try {
    const body = await c.req.json();

    // バリデーション
    const result = updatePositionsSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        { error: "Validation error", issues: result.error.issues },
        400,
      );
    }

    await updateTaskPositions(result.data.updates);
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to update task positions:", error);
    return c.json({ error: "Failed to update task positions" }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
