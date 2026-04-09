import { useState } from "react";
import { resetPromoterPassword } from "@promolocation/shared";
import AlertDialog from "./AlertDialog";
import PwaScreenHeader from "./PwaScreenHeader";

type ForgotPasswordScreenProps = {
  apiKey?: string | null;
  onBack: () => void;
  onDone: () => void;
};

export default function ForgotPasswordScreen({
  apiKey,
  onBack,
  onDone,
}: ForgotPasswordScreenProps) {
  const [promoterId, setPromoterId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    message: string;
    title: string;
    type: "success" | "error";
  }>({
    message: "",
    title: "",
    type: "success",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error",
  ) => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);

    if (alertConfig.type === "success") {
      onDone();
    }
  };

  const handleResetPassword = async () => {
    if (!promoterId.trim()) {
      showAlert("Error", "Please enter your Promoter ID.", "error");
      return;
    }

    setIsLoading(true);

    try {
      await resetPromoterPassword(promoterId.trim(), apiKey);
      showAlert(
        "Password Reset",
        'Your password has been reset to "password". You are required to change it when you log in.',
        "success",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.";
      showAlert("Error", message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="screen-shell">
      <div className="mobile-page-card">
        <PwaScreenHeader onBack={onBack} showBackButton title="Forgot Password" />

        <section className="mobile-form-content">
          <p className="screen-description">
            Enter your Promoter ID to reset your password. Your new password
            will be "password" and you&apos;ll be required to change it after
            logging in.
          </p>

          <label className="mobile-field">
            <span>Promoter ID</span>
            <input
              className="mobile-input"
              disabled={isLoading}
              onChange={(event) => setPromoterId(event.target.value)}
              placeholder="Enter your Promoter ID"
              value={promoterId}
            />
          </label>

          <button
            className="fixed-width-primary"
            disabled={isLoading}
            onClick={handleResetPassword}
            type="button"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </section>
      </div>

      <AlertDialog
        message={alertConfig.message}
        onClose={handleCloseAlert}
        title={alertConfig.title}
        type={alertConfig.type}
        visible={alertVisible}
      />
    </main>
  );
}
