export const API_CONFIG = {
  BASE_URL: "https://promolocation.nubiaville.com/api/",
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
};

export default API_CONFIG;
