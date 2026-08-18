// Типы для авторизации
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

// Типы для валют
export interface CurrencyData {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CurrencyHistory {
  dates: string[];
  rates: Record<string, number>;
}

// Типы для карточки
export interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  cardType: "visa" | "mastercard" | "amex" | "discover";
  backgroundColor: string;
}
