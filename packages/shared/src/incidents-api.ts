import { API_CONFIG } from "./api-config";
import type { Incident } from "./api-types";
import { fetchApiKey } from "./auth-api";

type UnknownRecord = Record<string, unknown>;

export interface IncidentPayload {
  description?: string;
  incident_name: string;
  photo?: File | null;
  promoter_id?: string | null;
  user_id?: string | number | null;
}

async function parseJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function createPromoterIncident(
  payload: IncidentPayload,
  existingApiKey?: string | null,
) {
  const apiKey = existingApiKey || (await fetchApiKey());
  const formData = new FormData();

  formData.append("token", apiKey);
  formData.append("incident_name", payload.incident_name);

  if (payload.user_id) {
    formData.append("user_id", String(payload.user_id));
  }

  if (payload.promoter_id) {
    formData.append("promoter_id", payload.promoter_id);
  }

  if (payload.description) {
    formData.append("description", payload.description);
  }

  if (payload.photo) {
    formData.append("photo", payload.photo, payload.photo.name);
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_INCIDENT}`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await parseJson(response)) as UnknownRecord | null;

  if (response.status === 200 && data && data.incident) {
    return data.incident as Incident;
  }

  const message =
    data && typeof data.message === "string"
      ? data.message
      : "Failed to create incident.";
  throw new Error(message);
}

export async function fetchPromoterIncidents(
  userId: string | number,
  existingApiKey?: string | null,
) {
  const apiKey = existingApiKey || (await fetchApiKey());
  const params = new URLSearchParams();

  params.append("token", apiKey);
  params.append("user_id", String(userId));

  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_INCIDENTS}?${params.toString()}`,
    {
      method: "GET",
    },
  );

  const data = (await parseJson(response)) as UnknownRecord | null;

  if (
    response.status === 200 &&
    data &&
    Array.isArray((data as UnknownRecord).incidents)
  ) {
    return (data as UnknownRecord).incidents as Incident[];
  }

  const message =
    data && typeof data.message === "string"
      ? data.message
      : "Failed to fetch incidents.";
  throw new Error(message);
}
