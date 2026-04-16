import { useState } from "react";
import type { LoginCredentials } from "@promolocation/shared";
import type { PwaInstallState } from "../hooks/usePwaInstall";
import PwaInstallCard from "./PwaInstallCard";

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="password-toggle-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.25 12C3.93 8.6 7.55 6.25 12 6.25C16.45 6.25 20.07 8.6 21.75 12C20.07 15.4 16.45 17.75 12 17.75C7.55 17.75 3.93 15.4 2.25 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="2.75"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="password-toggle-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M10.58 6.41C11.03 6.31 11.5 6.25 12 6.25C16.45 6.25 20.07 8.6 21.75 12C21.04 13.43 19.99 14.66 18.7 15.57"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M14.83 14.83C14.11 15.55 13.1 16 12 16C9.79 16 8 14.21 8 12C8 10.9 8.45 9.89 9.17 9.17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.1 6.11C4.56 7.08 3.26 8.41 2.25 12C3.93 15.4 7.55 17.75 12 17.75C13.38 17.75 14.69 17.52 15.89 17.09"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

type LoginScreenProps = {
  error: string | null;
  isLoading: boolean;
  install: PwaInstallState;
  onForgotPassword: () => void;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
};

export default function LoginScreen({
  error,
  isLoading,
  install,
  onForgotPassword,
  onSubmit,
}: LoginScreenProps) {
  const [promoterId, setPromoterId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!promoterId.trim() || !password.trim()) {
      setLocalError("Enter both your promoter ID and password.");
      return;
    }

    setLocalError(null);

    try {
      await onSubmit({
        promoter_id: promoterId.trim(),
        password,
      });
    } catch {
      // Error state is handled by the parent and surfaced through props.
    }
  };

  const activeError = localError || error;

  return (
    <main className="auth-screen auth-screen-mobile">
      <section className="auth-mobile-shell">
        <div className="auth-mobile-header">
          <h1>Welcome Back</h1>
          <p>Login to access your dashboard.</p>
        </div>

        <form className="auth-mobile-form" onSubmit={handleSubmit}>
          <label className="mobile-field">
            <span>Promoter ID</span>
            <input
              autoCapitalize="none"
              autoComplete="username"
              className="mobile-input auth-mobile-input"
              onChange={(event) => setPromoterId(event.target.value)}
              placeholder="Enter your Promoter ID"
              value={promoterId}
            />
          </label>

          <label className="mobile-field">
            <span>Password</span>
            <div className="password-field-row auth-mobile-password-row">
              <input
                autoComplete="current-password"
                className="mobile-input password-input-web auth-mobile-input"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="password-toggle-button auth-mobile-toggle"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>

          {activeError ? <p className="form-error auth-mobile-error">{activeError}</p> : null}

          <div className="auth-mobile-options-row">
            <button
              className="auth-mobile-forgot"
              onClick={onForgotPassword}
              type="button"
            >
              Forgot Password?
            </button>
          </div>

          <button
            className="fixed-width-primary auth-mobile-login-button"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-mobile-install">
          <PwaInstallCard install={install} />
        </div>
      </section>
    </main>
  );
}
