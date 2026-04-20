import { useEffect, useState } from "react";
import changePasswordIcon from "../../../../assets/images/changepassword.png";
import {
  readNotificationPreference,
  requestBrowserNotificationPermission,
  writeNotificationPreference,
} from "../browserNotifications";
import type { PwaInstallState } from "../hooks/usePwaInstall";
import PwaInstallCard from "./PwaInstallCard";
import PwaScreenHeader from "./PwaScreenHeader";

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-inline-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M18 10.2C18 7 15.3 4.5 12 4.5C8.7 4.5 6 7 6 10.2V13.8L4.5 16.5H19.5L18 13.8V10.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.5 18.5C10 19.4 10.9 20 12 20C13.1 20 14 19.4 14.5 18.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

type SettingsScreenProps = {
  install: PwaInstallState;
  onBack: () => void;
  onOpenChangePassword: () => void;
};

export default function SettingsScreen({
  install,
  onBack,
  onOpenChangePassword,
}: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    readNotificationPreference,
  );
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null,
  );
  useEffect(() => {
    writeNotificationPreference(notificationsEnabled);
  }, [notificationsEnabled]);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      setNotificationMessage(
        "Notifications are not live yet. This preference is saved for later.",
      );
      return;
    }

    const { enabled, message } = await requestBrowserNotificationPermission();

    setNotificationsEnabled(enabled);
    setNotificationMessage(
      enabled
        ? "Notifications are not live yet. We saved this preference for later."
        : message,
    );
  };

  return (
    <main className="screen-shell">
      <div className="mobile-page-card">
        <PwaScreenHeader onBack={onBack} showBackButton title="Settings" />

        <section className="list-screen-content settings-screen-content">
          <div className="settings-list">
            <button
              className="settings-menu-item"
              onClick={onOpenChangePassword}
              type="button"
            >
              <div className="settings-menu-item-left">
                <span className="settings-icon-shell">
                  <img
                    alt=""
                    className="settings-menu-icon-image"
                    src={changePasswordIcon}
                  />
                </span>
                <span className="settings-menu-label">Change Password</span>
              </div>
              <span className="settings-menu-chevron">&gt;</span>
            </button>

            <div className="settings-menu-item settings-toggle-item">
              <div className="settings-menu-item-left">
                <span className="settings-icon-shell settings-notification-icon">
                  <BellIcon />
                </span>
                <span className="settings-menu-label">
                  Enable Notifications
                  <span className="settings-not-live-tag">Not live yet</span>
                </span>
              </div>

              <button
                aria-pressed={notificationsEnabled}
                className={`settings-switch ${notificationsEnabled ? "settings-switch-enabled" : ""}`}
                onClick={handleToggleNotifications}
                type="button"
              >
                <span className="settings-switch-thumb" />
              </button>
            </div>
          </div>

          {notificationMessage ? (
            <p className="settings-help-text">{notificationMessage}</p>
          ) : (
            <p className="settings-help-text">
              Notifications are not live yet. You can save your preference now,
              and we will wire delivery in later.
            </p>
          )}

          <PwaInstallCard install={install} persistent />
        </section>
      </div>
    </main>
  );
}
