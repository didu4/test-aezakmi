import { useState, useEffect } from "react";
import {
  getCurrentRates,
  getAvailableCurrencies,
  getCurrencyHistory,
} from "../api/currencyAPI";
import type { CurrencyData, CurrencyHistory } from "../types";

// Хук для получения списка валют
export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAvailableCurrencies();
        setCurrencies(data);
      } catch {
        setError("Ошибка загрузки списка валют");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []); // Пустой массив - выполнится один раз при монтировании

  return { currencies, loading, error };
};

// Хук для получения текущих курсов
export const useRates = (baseCurrency: string = "USD") => {
  const [rates, setRates] = useState<CurrencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCurrentRates(baseCurrency);
        setRates(data);
      } catch {
        setError("Ошибка загрузки курсов валют");
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [baseCurrency]); // Выполнится при изменении baseCurrency

  return { rates, loading, error };
};

// Хук для получения истории курса
export const useCurrencyHistory = (
  from: string,
  to: string,
  days: number = 30,
) => {
  const [history, setHistory] = useState<CurrencyHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCurrencyHistory(from, to, days);
        setHistory(data);
      } catch {
        setError("Ошибка загрузки истории курса");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [from, to, days]); // Выполнится при изменении любого из параметров

  return { history, loading, error };
};
