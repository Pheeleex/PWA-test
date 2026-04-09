import { useState } from "react";
import type { LoginCredentials } from "@promolocation/shared";
import type { PwaInstallState } from "../hooks/usePwaInstall";
import PwaInstallCard from "./PwaInstallCard";

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
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Promolocation</p>
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Login to access your dashboard.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Promoter ID</span>
            <input
              autoCapitalize="none"
              autoComplete="username"
              className="input"
              onChange={(event) => setPromoterId(event.target.value)}
              placeholder="Enter your promoter ID"
              value={promoterId}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="password-row">
              <input
                autoComplete="current-password"
                className="input"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                className="ghost-button"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {activeError ? <p className="form-error">{activeError}</p> : null}

          <div className="auth-options-row">
            <button
              className="text-link-button"
              onClick={onForgotPassword}
              type="button"
            >
              Forgot Password?
            </button>
          </div>

          <button className="primary-button" disabled={isLoading} type="submit">
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer-note">
          <span className="status-dot status-green" />
          <p>After login, the browser app follows the mobile map, settings, and QR flow.</p>
        </div>

        <PwaInstallCard install={install} />
      </section>
    </main>
  );
}
