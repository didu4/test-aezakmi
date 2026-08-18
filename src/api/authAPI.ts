import type { User, LoginCredentials, AuthResponse } from "../types";

// Мок-база данных пользователей
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Администратор",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "Пользователь",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
  },
];

// Имитация задержки сети
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Генерация мок-токена
const generateToken = (user: User): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    timestamp: Date.now(),
    expires: Date.now() + 24 * 60 * 60 * 1000,
  };
  return btoa(JSON.stringify(payload));
};

// Mock login API
export const mockLogin = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  await delay(800); // Имитация запроса к серверу

  const user = MOCK_USERS.find((u) => u.email === credentials.email);

  if (!user || user.password !== credentials.password) {
    throw new Error("Неверный email или пароль");
  }

  const userWithoutPassword: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
  };
  const token = generateToken(userWithoutPassword);

  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword));

  return {
    token,
    user: userWithoutPassword,
  };
};

// Mock logout
export const mockLogout = async (): Promise<void> => {
  await delay(300);
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};

// Проверка авторизации
export const checkAuth = (): boolean => {
  const token = localStorage.getItem("auth_token");
  if (!token) return false;

  try {
    const decoded = JSON.parse(atob(token));
    return decoded.expires > Date.now();
  } catch {
    return false;
  }
};

// Получение текущего пользователя
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("auth_user");
  return userStr ? JSON.parse(userStr) : null;
};
