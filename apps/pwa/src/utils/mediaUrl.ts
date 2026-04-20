const PROMOLOCATION_MEDIA_BASE_URL = "https://promolocation.nubiaville.com/";

export function resolvePromolocationMediaUrl(rawUrl?: string | null) {
  const trimmedUrl = typeof rawUrl === "string" ? rawUrl.trim() : "";

  if (!trimmedUrl) {
    return "";
  }

  if (
    trimmedUrl.startsWith("http") ||
    trimmedUrl.startsWith("blob:") ||
    trimmedUrl.startsWith("data:") ||
    trimmedUrl.startsWith("file:")
  ) {
    return trimmedUrl;
  }

  return `${PROMOLOCATION_MEDIA_BASE_URL}${
    trimmedUrl.startsWith("/") ? trimmedUrl.slice(1) : trimmedUrl
  }`;
}
