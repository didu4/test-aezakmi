import { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cardSchema } from '../utils/validation';
import type { CardFormData } from '../utils/validation';

const CardFormPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
      cardType: 'visa',
      backgroundColor: '#2563eb',
    },
  });

  // Изменено: useWatch вместо watch()
  const watchAllFields = useWatch({ control });

  const onSubmit = async (data: CardFormData) => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const formattedData = {
      ...data,
      cardNumber: data.cardNumber.replace(/\s/g, ''),
    };
    
    alert(`Карта создана!\n\n${JSON.stringify(formattedData, null, 2)}`);
    setIsSubmitting(false);
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    return `${digits.substr(0, 2)}/${digits.substr(2, 2)}`;
  };

  const cardTypes = ['visa', 'mastercard', 'amex', 'discover'] as const;
  const cardColors = ['#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Создание карточки</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Форма */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Номер карты */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Номер карты
              </label>
              <Controller
                name="cardNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className={`input-field mt-1 ${errors.cardNumber ? 'input-error' : ''}`}
                    maxLength={19}
                  />
                )}
              />
              {errors.cardNumber && (
                <p className="mt-2 text-sm text-red-600">{errors.cardNumber.message}</p>
              )}
            </div>

            {/* Имя держателя */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Имя держателя карты
              </label>
              <input
                {...register('cardholderName')}
                placeholder="IVAN IVANOV"
                className={`input-field mt-1 ${errors.cardholderName ? 'input-error' : ''}`}
              />
              {errors.cardholderName && (
                <p className="mt-2 text-sm text-red-600">{errors.cardholderName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Срок действия */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Срок действия
                </label>
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      onChange={(e) => field.onChange(formatExpiryDate(e.target.value))}
                      placeholder="MM/YY"
                      className={`input-field mt-1 ${errors.expiryDate ? 'input-error' : ''}`}
                      maxLength={5}
                    />
                  )}
                />
                {errors.expiryDate && (
                  <p className="mt-2 text-sm text-red-600">{errors.expiryDate.message}</p>
                )}
              </div>

              {/* CVV */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  {...register('cvv')}
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  className={`input-field mt-1 ${errors.cvv ? 'input-error' : ''}`}
                />
                {errors.cvv && (
                  <p className="mt-2 text-sm text-red-600">{errors.cvv.message}</p>
                )}
              </div>
            </div>

            {/* Тип карты */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип карты
              </label>
              <div className="grid grid-cols-4 gap-2">
                {cardTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const event = { target: { value: type } };
                      register('cardType').onChange(event);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      watchAllFields.cardType === type
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Цвет карты */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цвет карты
              </label>
              <div className="flex gap-2">
                {cardColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const event = { target: { value: color } };
                      register('backgroundColor').onChange(event);
                    }}
                    className={`w-8 h-8 rounded-full border-2 ${
                      watchAllFields.backgroundColor === color
                        ? 'border-gray-900 scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3"
            >
              {isSubmitting ? 'Создание...' : 'Создать карту'}
            </button>
          </form>
        </div>

        {/* Превью карты */}
        <div className="lg:sticky lg:top-8 h-fit">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Превью карты</h2>
          <div
            className="relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-xl shadow-2xl p-6 text-white transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${watchAllFields.backgroundColor || '#2563eb'}, ${watchAllFields.backgroundColor || '#2563eb'}cc)`,
            }}
          >
            {/* Чип */}
            <div className="absolute top-6 left-6 w-12 h-9 bg-yellow-400 rounded-md opacity-80"></div>
            
            {/* Тип карты */}
            <div className="absolute top-6 right-6 text-lg font-bold uppercase">
              {watchAllFields.cardType || 'visa'}
            </div>

            {/* Номер карты */}
            <div className="absolute top-1/2 left-6 right-6 transform -translate-y-1/2">
              <div className="text-xl sm:text-2xl font-mono tracking-wider">
                {watchAllFields.cardNumber || '•••• •••• •••• ••••'}
              </div>
            </div>

            {/* Имя и срок */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                <div className="text-xs uppercase text-gray-300 mb-1">Card Holder</div>
                <div className="font-medium">
                  {watchAllFields.cardholderName || 'YOUR NAME'}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-300 mb-1">Expires</div>
                <div className="font-medium">
                  {watchAllFields.expiryDate || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardFormPage;