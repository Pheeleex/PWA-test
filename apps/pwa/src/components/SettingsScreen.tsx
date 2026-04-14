import { useEffect, useMemo, useState } from "react";
import type { AuthenticatedUser } from "@promolocation/shared";
import changePasswordIcon from "../../../../assets/images/changepassword.png";
import type { PwaInstallState } from "../hooks/usePwaInstall";
import PwaInstallCard from "./PwaInstallCard";
import PwaScreenHeader from "./PwaScreenHeader";

const NOTIFICATION_PREFERENCE_KEY = "promolocation-pwa-notifications-enabled";

type SettingsScreenProps = {
  install: PwaInstallState;
  onBack: () => void;
  onOpenChangePassword: () => void;
  onOpenProfile: () => void;
  session: {
    user: AuthenticatedUser;
  };
};

function readNotificationPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  const storedValue = window.localStorage.getItem(NOTIFICATION_PREFERENCE_KEY);

  if (storedValue === null) {
    return typeof Notification !== "undefined" && Notification.permission === "granted";
  }

  return storedValue === "true";
}

function writeNotificationPreference(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    NOTIFICATION_PREFERENCE_KEY,
    enabled ? "true" : "false",
  );
}

export default function SettingsScreen({
  install,
  onBack,
  onOpenChangePassword,
  onOpenProfile,
  session,
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

  const profileInitial = useMemo(() => {
    return session.user.fullname?.trim().charAt(0).toUpperCase() || "P";
  }, [session.user.fullname]);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      setNotificationMessage("Browser notifications have been turned off for this device.");
      return;
    }

    if (typeof Notification === "undefined") {
      setNotificationMessage("This browser does not support notifications.");
      setNotificationsEnabled(false);
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      setNotificationMessage("Browser notifications are enabled on this device.");
      return;
    }

    if (Notification.permission === "denied") {
      setNotificationsEnabled(false);
      setNotificationMessage(
        "Notifications are blocked in this browser. Re-enable them in browser settings first.",
      );
      return;
    }

    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";

    setNotificationsEnabled(enabled);
    setNotificationMessage(
      enabled
        ? "Browser notifications are enabled on this device."
        : "Notification permission was not granted.",
    );
  };

  return (
    <main className="screen-shell">
      <div className="mobile-page-card">
        <PwaScreenHeader onBack={onBack} showBackButton title="Settings" />

        <section className="list-screen-content settings-screen-content">
          <button className="settings-profile-card" onClick={onOpenProfile} type="button">
            <div className="settings-profile-avatar">
              {session.user.avatar ? (
                <img
                  alt={session.user.fullname || "Promoter avatar"}
                  className="settings-profile-avatar-image"
                  src={session.user.avatar}
                />
              ) : (
                <span>{profileInitial}</span>
              )}
            </div>
            <div className="settings-profile-copy">
              <strong>{session.user.fullname || "Promoter"}</strong>
              <p>{session.user.promoter_id}</p>
            </div>
            <span className="settings-menu-chevron">&gt;</span>
          </button>

          <div className="settings-list">
            <button className="settings-menu-item" onClick={onOpenChangePassword} type="button">
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
                  <span className="settings-bell-glyph">!</span>
                </span>
                <span className="settings-menu-label">Enable Notifications</span>
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
              Browser notifications are optional here and stay device-specific.
            </p>
          )}

          <PwaInstallCard install={install} persistent />
        </section>
      </div>
    </main>
  );
}
