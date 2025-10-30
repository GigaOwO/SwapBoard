/**
 * タスクのステータス
 */
export const TASK_STATUS = {
  TODO: "todo",
  DOING: "doing",
  DONE: "done",
} as const;

/**
 * タスクステータスの型
 */
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

/**
 * タスクステータスの表示名マップ
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TASK_STATUS.TODO]: "Todo",
  [TASK_STATUS.DOING]: "Doing",
  [TASK_STATUS.DONE]: "Done",
};

/**
 * タスクステータスの配列(順序保証)
 */
export const TASK_STATUSES: TaskStatus[] = [
  TASK_STATUS.TODO,
  TASK_STATUS.DOING,
  TASK_STATUS.DONE,
];

/**
 * タスクステータスの色設定
 */
export const TASK_STATUS_COLORS = {
  [TASK_STATUS.TODO]: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    card: "bg-white border-blue-200",
  },
  [TASK_STATUS.DOING]: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    card: "bg-white border-amber-200",
  },
  [TASK_STATUS.DONE]: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    card: "bg-white border-emerald-200",
  },
} as const;
