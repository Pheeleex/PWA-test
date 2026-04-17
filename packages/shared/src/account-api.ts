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
}

export interface ProfileSessionCredentials extends SessionCredentials {
  promoterId: string;
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

function normalizeUserPatch(userPatch: Partial<AuthenticatedUser> | null) {
  if (!userPatch) {
    return {};
  }

  const normalizedPatch: Partial<AuthenticatedUser> = {
    ...userPatch,
  };

  if ("avatar" in userPatch) {
    normalizedPatch.avatar =
      typeof userPatch.avatar === "string" && userPatch.avatar.trim().length > 0
        ? userPatch.avatar
        : null;
  }

  if ("reset_key" in (userPatch as UnknownRecord) || "resetKey" in userPatch) {
    const resetValue =
      (userPatch as UnknownRecord).resetKey ?? (userPatch as UnknownRecord).reset_key;
    normalizedPatch.resetKey = String(resetValue ?? "No");
  }

  return normalizedPatch;
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
    message = "Promoter Code not found.";
  }

  throw new Error(message);
}

export async function updatePromoterProfile(
  session: ProfileSessionCredentials,
  profile: ProfileUpdatePayload,
  avatarFile?: File | null,
  removeAvatar = false,
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
  };

  if (profile.fullname.trim()) {
    const nameParts = profile.fullname.trim().split(/\s+/);
    fields.first_name = nameParts[0];
    fields.last_name = nameParts.slice(1).join(" ") || nameParts[0];
  }

  let response: Response;

  if (avatarFile || removeAvatar) {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    } else if (removeAvatar) {
      formData.append("remove_avatar", "1");
    }

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

  return normalizeUserPatch(nextUser);
}

export async function deletePromoterProfilePicture(
  session: SessionCredentials,
) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_PROFILE_PICTURE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        token: session.apiKey,
        jwt: session.accessToken,
      }),
    },
  );

  const data = (await parseJson(response)) as UnknownRecord | null;

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (response.status !== 200) {
    const message =
      data && typeof data.message === "string"
        ? data.message
        : "Failed to delete profile picture.";
    throw new Error(message);
  }

  return data;
}

export async function refreshPromoterUser(
  session: ProfileSessionCredentials,
) {
  const requestUser = async (apiKey: string) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_USER_DATA}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          token: apiKey,
          promoter_id: session.promoterId,
        }),
      },
    );

    const data = (await parseJson(response)) as UnknownRecord | null;
    return { data, response };
  };

  let { data, response } = await requestUser(session.apiKey);

  if (response.status === 401) {
    const refreshedApiKey = await fetchApiKey();
    ({ data, response } = await requestUser(refreshedApiKey));
  }

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    const message =
      data && typeof data.message === "string"
        ? data.message
        : "Unable to refresh your profile right now.";
    throw new Error(message);
  }

  const nextUserCollection =
    data && typeof data === "object" && "user" in data
      ? (data.user as unknown)
      : null;

  if (Array.isArray(nextUserCollection) && nextUserCollection.length > 0) {
    return normalizeUserPatch(nextUserCollection[0] as Partial<AuthenticatedUser>);
  }

  const nextUser =
    data && typeof data === "object" && "data" in data
      ? (data.data as Partial<AuthenticatedUser>)
      : (data as Partial<AuthenticatedUser> | null);

  return normalizeUserPatch(nextUser);
}
