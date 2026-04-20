import { useEffect, useState } from "react";
import type { LoginCredentials } from "@promolocation/shared";
import type { PwaInstallState } from "../hooks/usePwaInstall";
import AlertDialog from "./AlertDialog";
import PasswordToggleIcon from "./PasswordToggleIcon";
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
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    message: "",
    title: "Error",
  });

  useEffect(() => {
    if (!error) {
      return;
    }

    setAlertConfig({
      message: error,
      title: "Error",
    });
    setAlertVisible(true);
  }, [error]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!promoterId.trim() || !password.trim()) {
      setAlertConfig({
        message: "Please enter both Promoter Code and password.",
        title: "Error",
      });
      setAlertVisible(true);
      return;
    }

    try {
      await onSubmit({
        promoter_id: promoterId.trim(),
        password,
      });
    } catch {
      // Error state is handled by the parent and surfaced through props.
    }
  };

  return (
    <main className="auth-screen auth-screen-mobile">
      <section className="auth-mobile-shell">
        <div className="auth-mobile-header">
          <h1>Welcome Back</h1>
          <p>Login to access your dashboard.</p>
        </div>

        <form className="auth-mobile-form" onSubmit={handleSubmit}>
          <label className="mobile-field">
            <span>Promoter Code</span>
            <input
              autoCapitalize="none"
              autoComplete="username"
              className="mobile-input auth-mobile-input"
              onChange={(event) => setPromoterId(event.target.value)}
              placeholder="Enter your Promoter Code"
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
                <PasswordToggleIcon visible={showPassword} />
              </button>
            </div>
          </label>

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

      <AlertDialog
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        title={alertConfig.title}
        type="error"
        visible={alertVisible}
      />
    </main>
  );
}
