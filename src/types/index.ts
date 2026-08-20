export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CurrencyData {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CurrencyHistory {
  dates: string[];
  rates: Record<string, number>;
}
