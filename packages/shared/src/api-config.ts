const REMOTE_API_BASE_URL = "https://promolocation.nubiaville.com/api/";
const DEV_PROXY_API_BASE_URL = "/api/";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function resolveApiBaseUrl() {
  const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof explicitBaseUrl === "string" && explicitBaseUrl.trim()) {
    return normalizeBaseUrl(explicitBaseUrl.trim());
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".vercel.app")
    ) {
      return DEV_PROXY_API_BASE_URL;
    }
  }

  return REMOTE_API_BASE_URL;
}

export const API_CONFIG = {
  BASE_URL: resolveApiBaseUrl(),
  TIMEOUT: 10000,
  ENDPOINTS: {
    GET_API_KEY: "getAPIKey",
    LOGIN: "login",
    UPDATE_PASSWORD: "update_password",
    UPDATE_PROFILE: "update_profile",
    CREATE_INCIDENT: "create_incident",
    GET_INCIDENTS: "get_incidents",
    GET_ACTIVE_LOCATIONS: "activate_location",
    GET_USER_DATA: "check_reset_password",
    RESET_PASSWORD: "user_reset_password",
    SAVE_PUSH_TOKEN: "user_tokens",
  },
} as const;

export type ApiConfig = typeof API_CONFIG;
