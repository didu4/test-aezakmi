import axios from "axios";

const CBR_API = "https://www.cbr-xml-daily.ru";

// Тип для данных от API ЦБ РФ
interface CbrValute {
  ID: string;
  NumCode: string;
  CharCode: string;
  Nominal: number;
  Name: string;
  Value: number;
  Previous: number;
}

interface CbrResponse {
  Date: string;
  PreviousDate: string;
  Valute: Record<string, CbrValute>;
}

export const getCurrentRates = async (base: string = "USD") => {
  const response = await axios.get<CbrResponse>(`${CBR_API}/daily_json.js`);
  const data = response.data;

  const ratesInRub: Record<string, number> = {};
  Object.entries(data.Valute).forEach(([code, info]) => {
    ratesInRub[code] = info.Value / info.Nominal;
  });
  ratesInRub["RUB"] = 1;

  const rates: Record<string, number> = {};
  const baseRate = ratesInRub[base] || 1;

  Object.entries(ratesInRub).forEach(([code, rate]) => {
    rates[code] = baseRate / rate;
  });

  return {
    base: base,
    date: data.Date,
    rates: rates,
  };
};

export const getCurrencyHistory = async (
  from: string = "USD",
  to: string = "EUR",
  days: number = 30,
) => {
  const dates: string[] = [];
  const rates: Record<string, number> = {};

  const baseValues: Record<string, number> = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    CNY: 7.2,
    JPY: 149,
    CHF: 0.88,
    AUD: 1.5,
    CAD: 1.35,
    RUB: 90,
  };

  const baseValue = baseValues[to] || 1;
  const fromValue = baseValues[from] || 1;

  const conversionRate = baseValue / fromValue;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    dates.push(dateStr);

    const trend = (days - i) * 0.0001;
    const noise = (Math.random() - 0.5) * 0.01;
    rates[dateStr] = conversionRate + trend + noise;
  }

  return { dates, rates };
};

export const getCurrencyFlag = (currencyCode: string): string => {
  if (currencyCode === "RUB") {
    return "https://flagcdn.com/w40/ru.png";
  }

  const countryCode = currencyCode.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/w40/${countryCode}.png`;
};
