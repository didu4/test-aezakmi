// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { loginSchema } from '../utils/validation';
import type { LoginFormData } from '../utils/validation';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,  // Добавьте setValue
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      const locationState = location.state as LocationState;
      const from = locationState?.from?.pathname || '/currencies';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Функция для заполнения демо-данными
  const fillDemoData = () => {
    setValue('email', 'user@example.com');
    setValue('password', 'user123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFEFF4] px-4">
      {/* Контейнер формы */}
      <div className="w-[436px] max-w-full bg-white rounded-[24px] p-[48px]">
        {/* Заголовок */}
        <div className="text-center mb-[24px]">
          <h1 
            className="text-[32px] font-bold leading-none mb-[8px]"
            style={{ 
              color: '#18184C',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
            }}
          >
            Log in
          </h1>
          <p 
            className="text-[15px] font-medium leading-none"
            style={{ 
              color: '#8E93A1',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            Welcome back
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[16px]" noValidate>
          {/* Поле Email */}
          <div className="flex flex-col gap-[12px]">
            <input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              className="w-full h-[56px] rounded-[16px] px-[20px] py-[16px] text-[16px] outline-none transition-all"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                backgroundColor: errors.email ? '#FFF2F2' : '#F6F6FB',
                border: errors.email ? '1.5px solid #EA3A3A' : '1.5px solid transparent',
              }}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-[#EA3A3A] -mt-[4px]">{errors.email.message}</p>
            )}
          </div>

          {/* Поле Password */}
          <div className="flex flex-col gap-[12px]">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full h-[56px] rounded-[16px] px-[20px] py-[16px] text-[16px] outline-none transition-all"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: errors.password ? '#FFF2F2' : '#F6F6FB',
                  border: errors.password ? '1.5px solid #EA3A3A' : '1.5px solid transparent',
                }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[20px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-[#EA3A3A] -mt-[4px]">{errors.password.message}</p>
            )}
          </div>

          {/* Кнопка Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[56px] rounded-[16px] text-white text-[16px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ 
              backgroundColor: '#18184C',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              boxShadow: '0px 4px 16px 0px rgba(24, 24, 76, 0.25)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        {/* Демо-доступ */}
        <div className="mt-[24px] text-center">
          <button
            type="button"
            onClick={fillDemoData}
            className="text-[14px] text-[#8E93A1] hover:text-[#18184C] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Demo: user@example.com / user123
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;