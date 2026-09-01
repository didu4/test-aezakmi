// src/pages/CurrencyTablePage.tsx
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/currency.scss";

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  if (isMobile && selectedCurrency) {
    return (
      <div className="currency-page">
        <button
          onClick={() => setSelectedCurrency(null)}
          className="currency-back-btn"
        >
          ← Back to table
        </button>

        <div className="currency-panel">
          <div className="currency-panel__header">
            <img
              src={getCurrencyFlag(selectedCurrency)}
              alt={`${selectedCurrency} flag`}
              className="currency-panel__flag"
            />
            <h2 className="currency-panel__title">{selectedCurrency} / USD</h2>
          </div>

          <p className="currency-panel__subtitle">
            {getPeriodLabel(selectedPeriod)}
          </p>

          <div className="currency-panel__stats">
            <span className="currency-panel__value">
              {selectedRate?.toFixed(4) || "0.0000"}
            </span>
            <span
              className={`currency-panel__change ${selectedChange > 0 ? "currency-panel__change--up" : "currency-panel__change--down"}`}
            >
              {selectedChange > 0 ? "▲" : "▼"}{" "}
              {Math.abs(selectedChange).toFixed(2)}%
            </span>
          </div>

          <div
            className={`currency-panel__chart-container ${selectedChange > 0 ? "currency-panel__chart-container--up" : "currency-panel__chart-container--down"}`}
          >
            {historyLoading ? (
              <Loading message="Загрузка графика..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={selectedChange > 0 ? "#22B14C" : "#EA3A3A"}
                        stopOpacity={0.14}
                      />
                      <stop
                        offset="95%"
                        stopColor={selectedChange > 0 ? "#22B14C" : "#EA3A3A"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
                  <XAxis dataKey="date" tick={false} axisLine={false} />
                  <YAxis
                    tick={false}
                    axisLine={false}
                    width={0}
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
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke={selectedChange > 0 ? "#22B14C" : "#EA3A3A"}
                    strokeWidth={2}
                    fill="url(#chartFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="currency-panel__periods">
            {["1W", "1M", "3M", "6M", "1Y"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`currency-panel__period-btn ${selectedPeriod === period ? "currency-panel__period-btn--active" : "currency-panel__period-btn--inactive"}`}
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
    <div className="currency-page">
      <div
        className={`currency-header ${selectedCurrency && !isMobile ? "currency-header--with-panel" : ""}`}
      >
        <h1 className="currency-title">Exchange rates</h1>
        <div className="currency-date">{formattedDate}</div>
      </div>

      <div className="currency-content">
        <div
          className={`currency-table-wrapper ${selectedCurrency && !isMobile ? "currency-table-wrapper--with-panel" : ""}`}
        >
          <table className="currency-table">
            <thead>
              <tr>
                {[
                  "Currency",
                  "Surrender",
                  "Buy",
                  "Course",
                  ...(!selectedCurrency ? ["Change", "Time"] : []),
                ].map((header) => (
                  <th key={header} className="currency-th">
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
                    className={`currency-row ${isSelected ? "currency-row--selected" : ""}`}
                  >
                    <td className="currency-td">
                      <div className="currency-cell">
                        <img
                          src={getCurrencyFlag(code)}
                          alt={`${code} flag`}
                          className="currency-flag"
                        />
                        <span className={isSelected ? "currency-td--bold" : ""}>
                          {code}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`currency-td ${isSelected ? "currency-td--bold" : ""}`}
                    >
                      {(rate * 1.01).toFixed(4)}
                    </td>
                    <td
                      className={`currency-td ${isSelected ? "currency-td--bold" : ""}`}
                    >
                      {(rate * 0.99).toFixed(4)}
                    </td>
                    <td
                      className={`currency-td ${isSelected ? "currency-td--bold" : ""}`}
                    >
                      {rate.toFixed(4)}
                    </td>
                    {!selectedCurrency && (
                      <>
                        <td className="currency-td">
                          <span
                            className={`currency-change ${change > 0 ? "currency-change--up" : "currency-change--down"}`}
                          >
                            {change > 0 ? "▲" : "▼"}{" "}
                            {Math.abs(change).toFixed(2)}%
                          </span>
                        </td>
                        <td className="currency-td currency-td--time">
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

        {selectedCurrency && !isMobile && (
          <div className="currency-panel">
            <div className="currency-panel__header">
              <img
                src={getCurrencyFlag(selectedCurrency)}
                alt={`${selectedCurrency} flag`}
                className="currency-panel__flag"
              />
              <h2 className="currency-panel__title">{selectedCurrency}/USD</h2>
            </div>

            <p className="currency-panel__subtitle">
              {getPeriodLabel(selectedPeriod)}
            </p>

            <div className="currency-panel__stats">
              <span className="currency-panel__value">
                {selectedRate?.toFixed(4) || "0.0000"}
              </span>
              <span
                className={`currency-panel__change ${selectedChange > 0 ? "currency-panel__change--up" : "currency-panel__change--down"}`}
              >
                {selectedChange > 0 ? "▲" : "▼"}{" "}
                {Math.abs(selectedChange).toFixed(2)}%
              </span>
            </div>

            <div
              className={`currency-panel__chart-container ${selectedChange > 0 ? "currency-panel__chart-container--up" : "currency-panel__chart-container--down"}`}
            >
              {historyLoading ? (
                <Loading message="Загрузка графика..." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="chartFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={selectedChange > 0 ? "#22B14C" : "#EA3A3A"}
                          stopOpacity={0.14}
                        />
                        <stop
                          offset="95%"
                          stopColor={selectedChange > 0 ? "#22B14C" : "#EA3A3A"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
                    <XAxis dataKey="date" tick={false} axisLine={false} />
                    <YAxis
                      tick={false}
                      axisLine={false}
                      width={0}
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
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke={selectedChange > 0 ? "#22B14C" : "#EA3A3A"}
                      strokeWidth={2}
                      fill="url(#chartFill)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="currency-panel__periods">
              {["1W", "1M", "3M", "6M", "1Y"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`currency-panel__period-btn ${selectedPeriod === period ? "currency-panel__period-btn--active" : "currency-panel__period-btn--inactive"}`}
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
