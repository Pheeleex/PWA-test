const NOTIFICATION_PREFERENCE_KEY = "promolocation-pwa-notifications-enabled";

export function readNotificationPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  const storedValue = window.localStorage.getItem(NOTIFICATION_PREFERENCE_KEY);

  if (storedValue === null) {
    return typeof Notification !== "undefined" && Notification.permission === "granted";
  }

  return storedValue === "true";
}

export function writeNotificationPreference(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    NOTIFICATION_PREFERENCE_KEY,
    enabled ? "true" : "false",
  );
}

export async function requestBrowserNotificationPermission() {
  if (typeof Notification === "undefined") {
    return {
      enabled: false,
      message: "This browser does not support notifications.",
    };
  }

  if (Notification.permission === "granted") {
    return {
      enabled: true,
      message: "Browser notifications are enabled on this device.",
    };
  }

  if (Notification.permission === "denied") {
    return {
      enabled: false,
      message:
        "Notifications are blocked in this browser. Re-enable them in browser settings first.",
    };
  }

  const permission = await Notification.requestPermission();
  const enabled = permission === "granted";

  return {
    enabled,
    message: enabled
      ? "Browser notifications are enabled on this device."
      : "Notification permission was not granted.",
  };
}
