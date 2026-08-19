// src/pages/CurrencyTablePage.tsx
import { useState, useMemo, useEffect } from 'react';
import { useCurrencies, useRates, useCurrencyHistory } from '../hooks/useCurrencyData';
import { getCurrencyFlag } from '../api/currencyAPI';
import Loading from '../components/UI/Loading';
import Error from '../components/UI/Error';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CurrencyTablePage = () => {
  const { loading: currenciesLoading, error: currenciesError } = useCurrencies();
  const { rates, loading: ratesLoading, error: ratesError } = useRates('USD');
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Маппинг периодов на дни
  const periodDays: Record<string, number> = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
  };
  
  const { history, loading: historyLoading } = useCurrencyHistory(
    'USD', 
    selectedCurrency || 'EUR', 
    periodDays[selectedPeriod] || 30
  );

  // Обновляем время каждую минуту
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Обновление каждую минуту
    
    return () => clearInterval(interval);
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!rates?.rates) return [];
    
    const allowedCurrencies = ['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'EUR', 'GBP', 'JPY'];
    
    return Object.entries(rates.rates)
      .filter(([code]) => allowedCurrencies.includes(code))
      .sort(([codeA], [codeB]) => codeA.localeCompare(codeB));
  }, [rates]);

  // Вычисляем изменения курсов
  const currencyChanges = useMemo(() => {
    if (!filteredCurrencies.length || !rates?.rates) return {};
    
    const changes: Record<string, number> = {};
    filteredCurrencies.forEach(([code, rate]) => {
      // Изменение относительно USD (1.0)
      changes[code] = (rate - 1) * 100;
    });
    return changes;
  }, [filteredCurrencies, rates]);

  // Данные для графика
  const chartData = useMemo(() => {
    if (!history) return [];
    
    return history.dates.map(date => ({
      date,
      rate: history.rates[date]
    }));
  }, [history]);

  // Текущий курс выбранной валюты
  const selectedRate = selectedCurrency ? rates?.rates?.[selectedCurrency] : null;
  const selectedChange = selectedCurrency ? currencyChanges[selectedCurrency] : 0;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  // Получение подзаголовка в зависимости от периода
  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      '1W': 'Weekly dynamics',
      '1M': 'Monthly dynamics',
      '3M': 'Quarterly dynamics',
      '6M': 'Semi-annual dynamics',
      '1Y': 'Yearly dynamics',
    };
    return labels[period] || 'Monthly dynamics';
  };

  if (currenciesLoading || ratesLoading) {
    return <Loading message="Загрузка данных о валютах..." />;
  }

  if (currenciesError || ratesError) {
    return <Error message={currenciesError || ratesError || 'Ошибка загрузки данных'} />;
  }

  return (
    <div className="p-[24px]">
      {/* Заголовок и дата */}
      <div className="flex justify-between items-center mb-[24px]">
        <h1 
          className="text-[32px] font-bold"
          style={{ color: '#18184C', fontFamily: 'Inter, sans-serif' }}
        >
          Exchange rates
        </h1>
        <div 
          className="px-[14px] py-[7px] rounded-[10px]"
          style={{ 
            backgroundColor: '#E7EEFF',
          }}
        >
          <span 
            className="text-[13px] font-semibold"
            style={{ color: '#2563EB', fontFamily: 'Inter, sans-serif' }}
          >
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex gap-[24px]">
        {/* Таблица */}
        <div 
          className={`flex-1 bg-white rounded-[20px] px-[20px] py-[4px] transition-all ${
            selectedCurrency ? 'max-w-[calc(100%-444px)]' : 'max-w-full'
          }`}
          style={{ boxShadow: '0px 2px 12px 0px rgba(0, 0, 0, 0.04)' }}
        >
          <table className="w-full">
            <thead>
              <tr className="h-[39px]">
                {['Currency', 'Surrender', 'Buy', 'Course', ...(selectedCurrency ? [] : ['Change', 'Time'])].map((header) => (
                  <th 
                    key={header}
                    className="text-left px-[12px]"
                    style={{ 
                      color: '#8E93A1',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
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
                    onClick={() => setSelectedCurrency(isSelected ? null : code)}
                    className="cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isSelected ? '#E7EEFF' : 'transparent',
                    }}
                  >
                    <td className="px-[12px] py-[16px] border-t border-[#E3E4EA]">
                      <div className="flex items-center gap-[12px]">
                        <img
                          src={getCurrencyFlag(code)}
                          alt={`${code} flag`}
                          className="w-[24px] h-[18px] object-cover rounded"
                        />
                        <span 
                          className={`${isSelected ? 'font-bold' : 'font-medium'} text-[14px]`}
                          style={{ 
                            color: isSelected ? '#18184C' : '#333',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {code}
                        </span>
                      </div>
                    </td>
                    <td className={`px-[12px] py-[16px] border-t border-[#E3E4EA] text-[14px] ${isSelected ? 'font-bold' : 'font-normal'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {(rate * 1.01).toFixed(4)}
                    </td>
                    <td className={`px-[12px] py-[16px] border-t border-[#E3E4EA] text-[14px] ${isSelected ? 'font-bold' : 'font-normal'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {(rate * 0.99).toFixed(4)}
                    </td>
                    <td className={`px-[12px] py-[16px] border-t border-[#E3E4EA] text-[14px] ${isSelected ? 'font-bold' : 'font-normal'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {rate.toFixed(4)}
                    </td>
                    {!selectedCurrency && (
                      <>
                        <td className="px-[12px] py-[16px] border-t border-[#E3E4EA]">
                          <span 
                            className="text-[12px] font-semibold px-[8px] py-[4px] rounded"
                            style={{ 
                              color: change > 0 ? '#22B14C' : '#EA3A3A',
                              backgroundColor: change > 0 ? '#E0F8E6' : '#FFF2F2',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            {change > 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-[12px] py-[16px] border-t border-[#E3E4EA] text-[14px]" style={{ color: '#8E93A1', fontFamily: 'Inter, sans-serif' }}>
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

        {/* Панель с графиком */}
        {selectedCurrency && (
          <div 
            className="w-[420px] bg-white rounded-[20px] p-[24px] shrink-0"
            style={{ boxShadow: '0px 2px 12px 0px rgba(0, 0, 0, 0.04)' }}
          >
            {/* Заголовок */}
            <div className="flex items-center gap-[8px] mb-[4px]">
              <img
                src={getCurrencyFlag(selectedCurrency)}
                alt={`${selectedCurrency} flag`}
                className="w-[24px] h-[18px] object-cover rounded"
              />
              <h2 
                className="text-[20px] font-bold"
                style={{ color: '#18184C', fontFamily: 'Inter, sans-serif' }}
              >
                {selectedCurrency}/USD
              </h2>
            </div>
            
            <p 
              className="text-[13px] mb-[20px]"
              style={{ color: '#8E93A1', fontFamily: 'Inter, sans-serif' }}
            >
              {getPeriodLabel(selectedPeriod)}
            </p>

            {/* Числовые данные */}
            <div className="flex items-center gap-[12px] mb-[20px]">
              <span 
                className="text-[36px] font-bold"
                style={{ color: '#18184C', fontFamily: 'Inter, sans-serif' }}
              >
                {selectedRate?.toFixed(4) || '0.0000'}
              </span>
              <span 
                className="px-[10px] py-[5px] rounded-[8px] text-[14px] font-semibold"
                style={{ 
                  color: selectedChange > 0 ? '#22B14C' : '#EA3A3A',
                  backgroundColor: selectedChange > 0 ? '#E0F8E6' : '#FFF2F2',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {selectedChange > 0 ? '▲' : '▼'} {Math.abs(selectedChange).toFixed(2)}%
              </span>
            </div>

            {/* График */}
            <div className="h-[400px] mb-[20px]">
              {historyLoading ? (
                <Loading message="Загрузка графика..." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E4EA" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: '#8E93A1' }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#8E93A1' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      formatter={(value) => [Number(value).toFixed(4), selectedCurrency]}
                      labelFormatter={(label) => new Date(String(label)).toLocaleDateString('ru-RU')}
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

            {/* Кнопки периодов */}
            <div className="flex gap-[8px]">
              {['1W', '1M', '3M', '6M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className="px-[16px] py-[8px] rounded-[10px] text-[13px] font-semibold transition-colors"
                  style={{ 
                    backgroundColor: selectedPeriod === period ? '#18184C' : '#F0F1F6',
                    color: selectedPeriod === period ? '#FFFFFF' : '#8E93A1',
                    fontFamily: 'Inter, sans-serif',
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