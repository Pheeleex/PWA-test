import { API_CONFIG } from "./api-config";
import type { AuthenticatedUser } from "./auth-api";
import { fetchApiKey } from "./auth-api";

type UnknownRecord = Record<string, unknown>;

export interface SessionCredentials {
  accessToken: string;
  apiKey: string;
}

export interface ProfileUpdatePayload {
  fullname: string;
  phone: string;
}

export interface ProfileSessionCredentials extends SessionCredentials {
  userId: number;
}

export interface PasswordUpdatePayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

async function parseJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function updatePromoterPassword(
  session: SessionCredentials,
  passwords: PasswordUpdatePayload,
) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PASSWORD}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        token: session.apiKey,
        jwt: session.accessToken,
        ...passwords,
      }),
    },
  );

  const data = (await parseJson(response)) as UnknownRecord | null;

  if (response.status !== 200) {
    const message =
      data && typeof data.message === "string"
        ? data.message
        : "Failed to update password.";
    throw new Error(message);
  }

  return data;
}

export async function resetPromoterPassword(
  promoterId: string,
  existingApiKey?: string | null,
) {
  const apiKey = existingApiKey || (await fetchApiKey());
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: apiKey,
        promoter_id: promoterId,
      }),
    },
  );

  const data = (await parseJson(response)) as UnknownRecord | null;

  if (response.status === 200) {
    return;
  }

  let message =
    data && typeof data.message === "string"
      ? data.message
      : "Failed to reset password. Please try again.";

  if (response.status === 404) {
    message = "Promoter ID not found.";
  }

  throw new Error(message);
}

export async function updatePromoterProfile(
  session: ProfileSessionCredentials,
  profile: ProfileUpdatePayload,
  avatarFile?: File | null,
) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.accessToken}`,
  };

  const fields: Record<string, string | number> = {
    token: session.apiKey,
    jwt: session.accessToken,
    user_id: session.userId,
    fullname: profile.fullname,
    phone: profile.phone,
  };

  if (profile.fullname.trim()) {
    const nameParts = profile.fullname.trim().split(/\s+/);
    fields.first_name = nameParts[0];
    fields.last_name = nameParts.slice(1).join(" ") || nameParts[0];
  }

  let response: Response;

  if (avatarFile) {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    formData.append("avatar", avatarFile);

    response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });
  } else {
    headers["Content-Type"] = "application/json";

    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(fields),
    });
  }

  const data = (await parseJson(response)) as UnknownRecord | null;

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (response.status !== 200) {
    const message =
      data && typeof data.message === "string"
        ? data.message
        : "Failed to update profile.";
    throw new Error(message);
  }

  const nextUser = (
    data?.user ??
    data?.data ??
    data
  ) as Partial<AuthenticatedUser> | null;

  return nextUser ?? {};
}
