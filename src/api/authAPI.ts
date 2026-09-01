import type { User, LoginCredentials, AuthResponse } from "../types";

// Мок-база данных пользователей
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Администратор",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "Пользователь",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateToken = (user: User): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    timestamp: Date.now(),
    expires: Date.now() + 24 * 60 * 60 * 1000,
  };
  return btoa(JSON.stringify(payload));
};

export const mockLogin = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  await delay(800);

  const user = MOCK_USERS.find((u) => u.email === credentials.email);

  if (!user || user.password !== credentials.password) {
    throw new Error("Неверный email или пароль");
  }

  const userWithoutPassword: User = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  const token = generateToken(userWithoutPassword);

  return {
    token,
    user: userWithoutPassword,
  };
};

export const mockLogout = async (): Promise<void> => {
  await delay(300);
};
