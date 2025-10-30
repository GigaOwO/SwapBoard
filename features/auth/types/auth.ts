import { z } from "zod";

/**
 * ログインフォームのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上で入力してください"),
});

/**
 * サインアップフォームのバリデーションスキーマ
 */
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上で入力してください"),
  confirmPassword: z
    .string()
    .min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

/**
 * ログインフォームの型
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * サインアップフォームの型
 */
export type SignupInput = z.infer<typeof signupSchema>;

/**
 * ユーザー情報の型
 */
export type User = {
  id: string;
  email: string;
  createdAt: Date;
};

/**
 * 認証状態の型
 */
export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};
