import { useState, useMemo, useEffect } from "react";
import {
  useCurrencies,
  useRates,
  useCurrencyHistory,
} from "../hooks/useCurrencyData";
import { getCurrencyFlag } from "../api/currencyAPI";
import Loading from "../components/UI/Loading";
import Error from "../components/UI/Error";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CurrencyTablePage = () => {
  const { loading: currenciesLoading, error: currenciesError } =
    useCurrencies();
  const { rates, loading: ratesLoading, error: ratesError } = useRates("USD");
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1M");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  const periodDays: Record<string, number> = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
  };

  const { history, loading: historyLoading } = useCurrencyHistory(
    "USD",
    selectedCurrency || "EUR",
    periodDays[selectedPeriod] || 30,
  );

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Обновляем время каждую минуту
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!rates?.rates) return [];

    const allowedCurrencies = [
      "AUD",
      "BGN",
      "BRL",
      "CAD",
      "CHF",
      "EUR",
      "GBP",
      "JPY",
    ];

    return Object.entries(rates.rates)
      .filter(([code]) => allowedCurrencies.includes(code))
      .sort(([codeA], [codeB]) => codeA.localeCompare(codeB));
  }, [rates]);

  const currencyChanges = useMemo(() => {
    if (!filteredCurrencies.length || !rates?.rates) return {};

    const changes: Record<string, number> = {};
    filteredCurrencies.forEach(([code, rate]) => {
      changes[code] = (rate - 1) * 100;
    });
    return changes;
  }, [filteredCurrencies, rates]);

  const chartData = useMemo(() => {
    if (!history) return [];

    return history.dates.map((date) => ({
      date,
      rate: history.rates[date],
    }));
  }, [history]);

  const selectedRate = selectedCurrency
    ? rates?.rates?.[selectedCurrency]
    : null;
  const selectedChange = selectedCurrency
    ? currencyChanges[selectedCurrency]
    : 0;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      "1W": "Weekly dynamics",
      "1M": "Monthly dynamics",
      "3M": "Quarterly dynamics",
      "6M": "Semi-annual dynamics",
      "1Y": "Yearly dynamics",
    };
    return labels[period] || "Monthly dynamics";
  };

  if (currenciesLoading || ratesLoading) {
    return <Loading message="Загрузка данных о валютах..." />;
  }

  if (currenciesError || ratesError) {
    return (
      <Error
        message={currenciesError || ratesError || "Ошибка загрузки данных"}
      />
    );
  }

  // Мобильный вид с выбранной валютой
  if (window.innerWidth < 1024 && selectedCurrency) {
    return (
      <div className="p-[16px]">
        {/* Заголовок */}
        <div className="flex flex-col gap-[12px] mb-[16px]">
          <h1
            className="text-[24px] font-bold"
            style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
          >
            Exchange rates
          </h1>
          <div
            className="px-[14px] py-[7px] rounded-[10px] inline-block w-fit"
            style={{ backgroundColor: "#E7EEFF" }}
          >
            <span
              className="text-[13px] font-semibold"
              style={{ color: "#2563EB", fontFamily: "Inter, sans-serif" }}
            >
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Кнопка назад */}
        <button
          onClick={() => setSelectedCurrency(null)}
          className="mb-[16px] px-[16px] py-[8px] rounded-[10px] text-[14px] font-semibold cursor-pointer transition-all hover:bg-gray-100"
          style={{
            color: "#2563EB",
            fontFamily: "Inter, sans-serif",
            backgroundColor: "#E7EEFF",
          }}
        >
          ← Back to table
        </button>

        {/* Панель с графиком */}
        <div
          className="bg-white rounded-[20px] p-[16px]"
          style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="flex items-center gap-[8px] mb-[4px]">
            <img
              src={getCurrencyFlag(selectedCurrency)}
              alt={`${selectedCurrency} flag`}
              className="w-[24px] h-[18px] object-cover rounded"
            />
            <h2
              className="text-[18px] font-bold"
              style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
            >
              {selectedCurrency}/USD
            </h2>
          </div>

          <p
            className="text-[13px] mb-[16px]"
            style={{ color: "#8E93A1", fontFamily: "Inter, sans-serif" }}
          >
            {getPeriodLabel(selectedPeriod)}
          </p>

          <div className="flex items-center gap-[12px] mb-[16px]">
            <span
              className="text-[28px] font-bold"
              style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
            >
              {selectedRate?.toFixed(4) || "0.0000"}
            </span>
            <span
              className="px-[10px] py-[5px] rounded-[8px] text-[13px] font-semibold"
              style={{
                color: selectedChange > 0 ? "#22B14C" : "#EA3A3A",
                backgroundColor: selectedChange > 0 ? "#E0F8E6" : "#FFF2F2",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {selectedChange > 0 ? "▲" : "▼"}{" "}
              {Math.abs(selectedChange).toFixed(2)}%
            </span>
          </div>

          <div className="h-[250px] mb-[16px]">
            {historyLoading ? (
              <Loading message="Загрузка графика..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E4EA" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "#8E93A1" }}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#8E93A1" }}
                    domain={["auto", "auto"]}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) => [
                      Number(value).toFixed(4),
                      selectedCurrency,
                    ]}
                    labelFormatter={(label) =>
                      new Date(String(label)).toLocaleDateString("ru-RU")
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex gap-[8px] flex-wrap">
            {["1W", "1M", "3M", "6M", "1Y"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className="px-[12px] py-[8px] rounded-[10px] text-[12px] font-semibold transition-colors cursor-pointer"
                style={{
                  backgroundColor:
                    selectedPeriod === period ? "#18184C" : "#F0F1F6",
                  color: selectedPeriod === period ? "#FFFFFF" : "#8E93A1",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-[16px] md:p-[24px]">
      {/* Заголовок */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-[12px] mb-[16px] md:mb-[24px]">
        <h1
          className="text-[24px] md:text-[32px] font-bold"
          style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
        >
          Exchange rates
        </h1>
        <div
          className="px-[14px] py-[7px] rounded-[10px] inline-block w-fit"
          style={{ backgroundColor: "#E7EEFF" }}
        >
          <span
            className="text-[13px] font-semibold"
            style={{ color: "#2563EB", fontFamily: "Inter, sans-serif" }}
          >
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Контейнер таблицы и панели */}
      <div className="flex flex-col lg:flex-row gap-[16px] md:gap-[24px]">
        {/* Таблица */}
        <div
          className={`bg-white rounded-[20px] px-[12px] md:px-[20px] py-[4px] overflow-x-auto ${
            selectedCurrency ? "lg:flex-1" : "w-full"
          }`}
          style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.04)" }}
        >
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="h-[39px]">
                {[
                  "Currency",
                  "Surrender",
                  "Buy",
                  "Course",
                  ...(!selectedCurrency ? ["Change", "Time"] : []),
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left px-[8px] md:px-[12px]"
                    style={{
                      color: "#8E93A1",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "11px md:text-[12px]",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCurrencies.map(([code, rate]) => {
                const change = currencyChanges[code] || 0;
                const isSelected = selectedCurrency === code;

                return (
                  <tr
                    key={code}
                    onClick={() =>
                      setSelectedCurrency(isSelected ? null : code)
                    }
                    className="cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isSelected ? "#E7EEFF" : "transparent",
                    }}
                  >
                    <td className="px-[8px] md:px-[12px] py-[12px] md:py-[16px] border-t border-[#E3E4EA]">
                      <div className="flex items-center gap-[8px] md:gap-[12px]">
                        <img
                          src={getCurrencyFlag(code)}
                          alt={`${code} flag`}
                          className="w-[20px] h-[14px] md:w-[24px] md:h-[18px] object-cover rounded"
                        />
                        <span
                          className={`${isSelected ? "font-bold" : "font-medium"} text-[12px] md:text-[14px]`}
                          style={{
                            color: isSelected ? "#18184C" : "#333",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {code}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-[8px] md:px-[12px] py-[12px] md:py-[16px] border-t border-[#E3E4EA] text-[12px] md:text-[14px] ${isSelected ? "font-bold" : "font-normal"}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {(rate * 1.01).toFixed(4)}
                    </td>
                    <td
                      className={`px-[8px] md:px-[12px] py-[12px] md:py-[16px] border-t border-[#E3E4EA] text-[12px] md:text-[14px] ${isSelected ? "font-bold" : "font-normal"}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {(rate * 0.99).toFixed(4)}
                    </td>
                    <td
                      className={`px-[8px] md:px-[12px] py-[12px] md:py-[16px] border-t border-[#E3E4EA] text-[12px] md:text-[14px] ${isSelected ? "font-bold" : "font-normal"}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {rate.toFixed(4)}
                    </td>
                    {!selectedCurrency && (
                      <>
                        <td className="px-[8px] md:px-[12px] py-[12px] md:py-[16px] border-t border-[#E3E4EA]">
                          <span
                            className="text-[11px] md:text-[12px] font-semibold px-[6px] md:px-[8px] py-[4px] rounded"
                            style={{
                              color: change > 0 ? "#22B14C" : "#EA3A3A",
                              backgroundColor:
                                change > 0 ? "#E0F8E6" : "#FFF2F2",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            {change > 0 ? "▲" : "▼"}{" "}
                            {Math.abs(change).toFixed(2)}%
                          </span>
                        </td>
                        <td
                          className="px-[8px] md:px-[12px] py-[12px] md:py-[16px] border-t border-[#E3E4EA] text-[12px] md:text-[14px]"
                          style={{
                            color: "#8E93A1",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {currentTime}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Панель с графиком — только на десктопе */}
        {selectedCurrency && !isMobile && (
          <div
            className="hidden lg:block w-[420px] bg-white rounded-[20px] p-[24px] shrink-0"
            style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.04)" }}
          >
            {/* Содержимое панели */}
            <div className="flex items-center gap-[8px] mb-[4px]">
              <img
                src={getCurrencyFlag(selectedCurrency)}
                alt={`${selectedCurrency} flag`}
                className="w-[24px] h-[18px] object-cover rounded"
              />
              <h2
                className="text-[20px] font-bold"
                style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
              >
                {selectedCurrency}/USD
              </h2>
            </div>

            <p
              className="text-[13px] mb-[20px]"
              style={{ color: "#8E93A1", fontFamily: "Inter, sans-serif" }}
            >
              {getPeriodLabel(selectedPeriod)}
            </p>

            <div className="flex items-center gap-[12px] mb-[20px]">
              <span
                className="text-[36px] font-bold"
                style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
              >
                {selectedRate?.toFixed(4) || "0.0000"}
              </span>
              <span
                className="px-[10px] py-[5px] rounded-[8px] text-[14px] font-semibold"
                style={{
                  color: selectedChange > 0 ? "#22B14C" : "#EA3A3A",
                  backgroundColor: selectedChange > 0 ? "#E0F8E6" : "#FFF2F2",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {selectedChange > 0 ? "▲" : "▼"}{" "}
                {Math.abs(selectedChange).toFixed(2)}%
              </span>
            </div>

            <div className="h-[400px] mb-[20px]">
              {historyLoading ? (
                <Loading message="Загрузка графика..." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E4EA" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#8E93A1" }}
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#8E93A1" }}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      formatter={(value) => [
                        Number(value).toFixed(4),
                        selectedCurrency,
                      ]}
                      labelFormatter={(label) =>
                        new Date(String(label)).toLocaleDateString("ru-RU")
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="flex gap-[8px]">
              {["1W", "1M", "3M", "6M", "1Y"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className="px-[16px] py-[8px] rounded-[10px] text-[13px] font-semibold transition-colors cursor-pointer"
                  style={{
                    backgroundColor:
                      selectedPeriod === period ? "#18184C" : "#F0F1F6",
                    color: selectedPeriod === period ? "#FFFFFF" : "#8E93A1",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyTablePage;
