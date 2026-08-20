// src/utils/validation.ts
import { z } from "zod";

// Схема для логина
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email обязателен")
    .email("Введите корректный email"),
  password: z
    .string()
    .min(1, "Пароль обязателен")
    .min(6, "Пароль должен содержать минимум 6 символов"),
});

// Схема для канбан-карточки
export const cardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.string().min(1, "Please select a priority"),
  status: z.string().optional(),
  assignee: z.string().optional(),
  deadline: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
