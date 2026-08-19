import { z } from "zod";

// Схема для логина
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Схема для карточки
export const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Номер карты должен содержать 16 цифр")
    .max(19, "Номер карты слишком длинный")
    .regex(/^[\d\s]+$/, "Только цифры"),

  cardholderName: z
    .string()
    .min(3, "Имя должно содержать минимум 3 символа")
    .max(50, "Имя слишком длинное")
    .regex(/^[a-zA-Zа-яА-Я\s]+$/, "Только буквы"),

  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Формат MM/YY"),

  cvv: z.string().regex(/^[0-9]{3,4}$/, "CVV должен содержать 3-4 цифры"),

  cardType: z.enum(["visa", "mastercard", "amex", "discover"]),
  backgroundColor: z.string(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
