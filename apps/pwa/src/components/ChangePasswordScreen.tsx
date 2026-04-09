import { useState } from "react";
import {
  updatePromoterPassword,
  type AuthenticatedUser,
} from "@promolocation/shared";
import AlertDialog from "./AlertDialog";
import PwaScreenHeader from "./PwaScreenHeader";

type ChangePasswordScreenProps = {
  forcedReset: boolean;
  onBack: () => void;
  onDone: () => void;
  onForgotPassword: () => void;
  session: {
    accessToken: string;
    apiKey: string;
    user: AuthenticatedUser;
  };
};

export default function ChangePasswordScreen({
  forcedReset,
  onBack,
  onDone,
  onForgotPassword,
  session,
}: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert("Missing Fields", "Please fill in all fields.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Error", "New passwords do not match.", "error");
      return;
    }

    if (newPassword === currentPassword) {
      showAlert(
        "Error",
        "New password must be different from old password.",
        "error",
      );
      return;
    }

    setIsLoading(true);

    try {
      await updatePromoterPassword(
        {
          accessToken: session.accessToken,
          apiKey: session.apiKey,
        },
        {
          old_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
      );
      showAlert("Success", "Password updated successfully.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update password.";
      showAlert("Error", message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="screen-shell">
      <div className="mobile-page-card">
        <PwaScreenHeader
          onBack={forcedReset ? undefined : onBack}
          showBackButton={!forcedReset}
          title="Change Password"
        />

        <section className="mobile-form-content">
          <label className="mobile-field">
            <span>Current Password</span>
            <div className="password-field-row">
              <input
                className="mobile-input password-input-web"
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter current password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
              />
              <button
                className="password-toggle-button"
                onClick={() => setShowCurrentPassword((value) => !value)}
                type="button"
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="mobile-field">
            <span>New Password</span>
            <div className="password-field-row">
              <input
                className="mobile-input password-input-web"
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
              />
              <button
                className="password-toggle-button"
                onClick={() => setShowNewPassword((value) => !value)}
                type="button"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="mobile-field">
            <span>Confirm Password</span>
            <div className="password-field-row">
              <input
                className="mobile-input password-input-web"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
              />
              <button
                className="password-toggle-button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                type="button"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button
            className="fixed-width-primary"
            disabled={isLoading}
            onClick={handleUpdate}
            type="button"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>

          {!forcedReset ? (
            <button className="text-link-standalone" onClick={onForgotPassword} type="button">
              Forgot Password?
            </button>
          ) : null}
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
