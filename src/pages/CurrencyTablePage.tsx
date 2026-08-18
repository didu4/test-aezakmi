import { useState, useMemo } from 'react';
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
  Legend
} from 'recharts';

const CurrencyTablePage = () => {
  const { currencies, loading: currenciesLoading, error: currenciesError } = useCurrencies();
  const { rates, loading: ratesLoading, error: ratesError } = useRates('USD');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { history, loading: historyLoading } = useCurrencyHistory('USD', selectedCurrency, 30);

  const filteredCurrencies = useMemo(() => {
    if (!rates?.rates) return [];
    
    return Object.entries(rates.rates)
      .filter(([code]) => 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (currencies[code] || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort(([codeA], [codeB]) => codeA.localeCompare(codeB));
  }, [rates, currencies, searchTerm]);

  const chartData = useMemo(() => {
    if (!history) return [];
    
    return history.dates.map(date => ({
      date,
      rate: history.rates[date]
    }));
  }, [history]);

  if (currenciesLoading || ratesLoading) {
    return <Loading message="Загрузка данных о валютах..." />;
  }

  if (currenciesError || ratesError) {
    return <Error message={currenciesError || ratesError || 'Ошибка загрузки данных'} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Курсы валют</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск валюты..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Валюта
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Код
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Курс к USD
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действие
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCurrencies.map(([code, rate]) => (
                <tr 
                  key={code}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedCurrency === code ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedCurrency(code)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={getCurrencyFlag(code)}
                        alt={`${code} flag`}
                        className="h-6 w-8 object-cover rounded mr-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x30?text=' + code;
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {currencies[code] || code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {rate.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCurrency(code);
                      }}
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    >
                      График
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCurrency && (
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Динамика USD → {selectedCurrency}
            </h2>
            <button
              onClick={() => setSelectedCurrency('')}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {historyLoading ? (
            <Loading message="Загрузка графика..." />
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis 
    dataKey="date" 
    tick={{ fontSize: 12 }}
    tickFormatter={(date: string) => new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
  />
  <YAxis 
    tick={{ fontSize: 12 }}
    domain={['auto', 'auto']}
  />
  <Tooltip 
  formatter={(value) => [Number(value).toFixed(4), selectedCurrency]}
  labelFormatter={(label) => new Date(String(label)).toLocaleDateString('ru-RU')}
/>
  <Legend />
  <Line
    type="monotone"
    dataKey="rate"
    stroke="#3b82f6"
    strokeWidth={2}
    dot={false}
    name={`USD/${selectedCurrency}`}
  />
</LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyTablePage;