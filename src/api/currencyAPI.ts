import axios from "axios";
import type { CurrencyData, CurrencyHistory } from "../types";

const API_BASE_URL = "https://api.frankfurter.app";

// Получение списка валют
export const getAvailableCurrencies = async () => {
  const response = await axios.get(`${API_BASE_URL}/currencies`);
  return response.data;
};

// Получение текущих курсов
export const getCurrentRates = async (
  base: string = "USD",
): Promise<CurrencyData> => {
  const response = await axios.get(`${API_BASE_URL}/latest?from=${base}`);
  return response.data;
};

// Получение истории курсов
export const getCurrencyHistory = async (
  from: string = "USD",
  to: string = "EUR",
  days: number = 30,
): Promise<CurrencyHistory> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const response = await axios.get(
    `${API_BASE_URL}/${startStr}..${endStr}?from=${from}&to=${to}`,
  );

  const dates = Object.keys(response.data.rates);
  const rates = dates.reduce(
    (acc, date) => {
      acc[date] = response.data.rates[date][to];
      return acc;
    },
    {} as Record<string, number>,
  );

  return { dates, rates };
};

// Флаги валют
export const getCurrencyFlag = (currencyCode: string): string => {
  const countryCode = currencyCode.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/w40/${countryCode}.png`;
};
