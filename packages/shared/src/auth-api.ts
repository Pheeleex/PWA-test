import { API_CONFIG } from "./api-config";
import type { ApiLocation } from "./api-types";

export interface AuthenticatedUser {
  user_id: number;
  promoter_id: string;
  email: string;
  fullname: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_role: string;
  avatar: string | null;
  active: boolean;
  email_verified: boolean;
  is_approved: boolean;
  area?: string;
  resetKey?: string;
  fcm_token?: string;
  promo_URL?: string;
}

export interface LoginCredentials {
  promoter_id: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  apiKey: string;
  user: AuthenticatedUser;
  resetKey?: string;
}

type UnknownRecord = Record<string, unknown>;

async function parseJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function extractApiKey(data: unknown) {
  if (Array.isArray(data) && data.length > 0) {
    const firstEntry = data[0] as UnknownRecord;
    return typeof firstEntry.api_key === "string" ? firstEntry.api_key : null;
  }

  if (data && typeof data === "object") {
    const objectData = data as UnknownRecord;
    return typeof objectData.api_key === "string" ? objectData.api_key : null;
  }

  return null;
}

function getLoginErrorMessage(status: number, fallback: string) {
  if (status === 404) return "No account found with this promoter code.";
  if (status === 400) return "Invalid credentials. Check your password.";
  if (status === 403) return "Email not verified.";
  if (status === 406) return "Account pending admin approval.";
  if (status === 423) return "Account has been deactivated.";
  return fallback;
}

export async function fetchApiKey() {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_API_KEY}`,
  );
  const data = await parseJson(response);

  if (!response.ok) {
    const fallback =
      data && typeof data === "object" && "message" in data
        ? String((data as UnknownRecord).message)
        : "Unable to retrieve API key.";
    throw new Error(fallback);
  }

  const apiKey = extractApiKey(data);

  if (!apiKey) {
    throw new Error("Unable to retrieve API key.");
  }

  return apiKey;
}

export async function loginPromoter(
  credentials: LoginCredentials,
  existingApiKey?: string | null,
): Promise<LoginResult> {
  const apiKey = existingApiKey || (await fetchApiKey());
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: apiKey,
      ...credentials,
    }),
  });

  const data = (await parseJson(response)) as UnknownRecord | null;

  if (response.status === 200 && data && typeof data.access_token === "string") {
    const user: AuthenticatedUser = {
      user_id: Number(data.user_id ?? 0),
      promoter_id: String(data.promoter_id ?? credentials.promoter_id),
      email: String(data.email ?? ""),
      fullname: String(data.fullname ?? ""),
      first_name: String(data.first_name ?? ""),
      last_name: String(data.last_name ?? ""),
      phone: String(data.phone ?? ""),
      user_role: String(data.user_role ?? ""),
      avatar: data.avatar ? String(data.avatar) : null,
      active: Boolean(data.active),
      email_verified: Boolean(data.email_verified),
      is_approved: Boolean(data.is_approved),
      area: data.area ? String(data.area) : undefined,
      resetKey: String(data.resetKey ?? data.reset_key ?? "No"),
      fcm_token: data.fcm_token ? String(data.fcm_token) : undefined,
      promo_URL:
        data.promo_URL
          ? String(data.promo_URL)
          : data.promo_url
            ? String(data.promo_url)
            : undefined,
    };

    if (!user.active) {
      throw new Error("Your account has been deactivated. Please contact support.");
    }

    return {
      accessToken: data.access_token,
      apiKey,
      user,
      resetKey: user.resetKey,
    };
  }

  const fallback =
    data && typeof data.message === "string" ? data.message : "Login failed.";
  throw new Error(getLoginErrorMessage(response.status, fallback));
}

export async function fetchActiveLocations(apiKey: string) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ACTIVE_LOCATIONS}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: apiKey,
      }),
    },
  );

  const data = await parseJson(response);

  if (!response.ok) {
    const fallback =
      data && typeof data === "object" && "message" in data
        ? String((data as UnknownRecord).message)
        : "Unable to load activation zones.";
    throw new Error(fallback);
  }

  if (Array.isArray(data)) {
    return data as ApiLocation[];
  }

  if (data && typeof data === "object") {
    const objectData = data as UnknownRecord;
    if (Array.isArray(objectData.locations)) {
      return objectData.locations as ApiLocation[];
    }

    if (Array.isArray(objectData.data)) {
      return objectData.data as ApiLocation[];
    }
  }

  return [];
}
