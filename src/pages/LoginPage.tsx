import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { loginSchema } from "../utils/validation";
import type { LoginFormData } from "../utils/validation";
import "../styles/login.scss";

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
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      const locationState = location.state as LocationState;
      const from = locationState?.from?.pathname || "/currencies";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const fillDemoData = () => {
    setValue("email", "user@example.com");
    setValue("password", "user123");
  };

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__header">
          <h1 className="login-page__title">Log in</h1>
          <p className="login-page__subtitle">Welcome back</p>
        </div>

        <form
          className="login-page__form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="login-page__field">
            <div className="login-page__input-wrapper">
              <span className="login-page__input-icon">✉</span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className={`login-page__input ${errors.email ? "login-page__input--error" : ""}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="login-page__error">{errors.email.message}</p>
            )}
          </div>

          <div className="login-page__field">
            <div className="login-page__input-wrapper">
              <span className="login-page__input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                className={`login-page__input ${errors.password ? "login-page__input--error" : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-page__password-toggle"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <p className="login-page__error">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-page__submit"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <div className="login-page__demo">
          <button
            type="button"
            onClick={fillDemoData}
            className="login-page__demo-btn"
          >
            Demo: user@example.com / user123
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
