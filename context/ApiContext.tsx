import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNetwork } from "./NetworkContext";
import API_CONFIG from "../constants/Api";

export interface Incident {
  incident_id?: string | number;
  id?: string;
  incident_name?: string;
  title?: string;
  type?: string;
  description: string;
  status: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  image?: string;
  photo?: string;
  user_id?: number;
  promoter_id?: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  admin_note?: string;
}

export interface Location {
  id?: string | number;
  location_id?: string | number;
  name?: string;
  location_name?: string;
  category?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  is_active?: boolean | number;
  description?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  type?: 'green' | 'red' | string;
}

interface CreateIncidentPayload {
  incident_name: string;
  description?: string;
  photo?: string | null;
  user_id?: string | number;
  promoter_id?: string;
}

interface GetIncidentsFilters {
  incident_id?: string | number;
  status?: "Pending" | "In Progress" | "Resolved";
}

interface GetActiveLocationsFilters {
  id?: string | number;
  category?: string;
  city?: string;
  search?: string;
}

interface ApiContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  incidents: Incident[];
  setIncidents: (incidents: Incident[]) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;

  createIncident: (
    reportContent: CreateIncidentPayload,
  ) => Promise<Incident | null>;
  getIncidents: (filters?: GetIncidentsFilters) => Promise<Incident[] | null>;

  getActiveLocations: (
    filters?: GetActiveLocationsFilters,
  ) => Promise<Location[] | null>;

  submitReport: (reportContent: {
    title: string;
    description: string;
    image?: string | null;
  }) => Promise<void>;

  apiError: string | null;
  setError: (error: string | null) => void;

  savePushToken: (token: string) => Promise<boolean>;

  fetchData: <T>(endpoint: string, options?: any) => Promise<T | null>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [apiError, setError] = useState<string | null>(null);
  const [wasOffline, setWasOffline] = useState(false);

  const { token, apiKey, logout, user, fetchApiKey } = useAuth();
  const { isConnected, isInternetReachable } = useNetwork();

  // Handle Automatic Background Refresh on Reconnection
  useEffect(() => {
    const isNowOnline = isConnected !== false && isInternetReachable !== false;
    
    // If the device was offline and is now back online
    if (wasOffline && isNowOnline) {
      console.log("[API] Connection restored. Triggering background sync...");
      
      // Refresh key app data in the background
      if (apiKey) {
        getActiveLocations();
        if (user?.user_id) {
          getIncidents();
        }
      }
      
      setWasOffline(false);
    } else if (!isNowOnline && !wasOffline) {
      // Record that we have gone offline
      setWasOffline(true);
    }
  }, [isConnected, isInternetReachable, wasOffline, apiKey, user?.user_id]);

  const fetchData = async <T,>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T | null> => {
    if (isConnected === false || isInternetReachable === false) {
      console.log("[API] Aborted: No internet connection");
      return null;
    }
    setIsLoading(true);
    setError(null);

    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    // Build headers
    const headers: any = {
      ...(options.headers || {}),
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    // Logging the request
    console.log(`[API ${options.method || "GET"}] Request:`, {
      url,
      headers,
      body: isFormData
        ? "[FormData]"
        : options.body
          ? JSON.parse(options.body as string)
          : null,
    });

    // In React Native, append secrets to FormData too
    if (isFormData && options.body) {
      const fb = options.body as FormData;
      if (apiKey && !fb.has("token")) fb.append("token", apiKey);
      if (user?.user_id && !fb.has("user_id"))
        fb.append("user_id", String(user.user_id));
      if (user?.promoter_id && !fb.has("promoter_id"))
        fb.append("promoter_id", user.promoter_id);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        console.warn(`[API] 401 Session Failure for URL: ${url}`);
        await logout(`API Call 401: ${url}`);
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`[API Error ${response.status}]:`, errorData);
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[API Success]:`, data);
      return data as T;
    } catch (e: any) {
      const message = e.message || "Something went wrong";
      setError(message);
      console.error("API Fetch Error:", e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createIncident = async ({
    incident_name,
    description,
    photo,
    user_id: payloadUserId,
    promoter_id: payloadPromoterId,
  }: CreateIncidentPayload): Promise<Incident | null> => {
    if (isConnected === false || isInternetReachable === false) {
      return null;
    }
    setIsLoading(true);
    setError(null);

    try {
      let currentApiKey = apiKey;

      if (!currentApiKey) {
        console.log("[DEBUG] apiKey missing in createIncident, fetching...");
        currentApiKey = await fetchApiKey();
      }

      if (!currentApiKey) {
        throw new Error("Unable to authorize request. Please check your internet connection.");
      }

      const finalUserId = user?.user_id || payloadUserId;
      const finalPromoterId = user?.promoter_id || payloadPromoterId;

      const formData = new FormData();
      formData.append("token", currentApiKey);
      if (finalUserId) formData.append("user_id", String(finalUserId));
      if (finalPromoterId) formData.append("promoter_id", finalPromoterId);
      formData.append("incident_name", incident_name);

      if (description) {
        formData.append("description", description);
      }

      if (photo) {
        const uriParts = photo.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("photo", {
          uri: photo,
          name: `incident_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      console.log("[API POST] Create Incident Payload:", {
        token: apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING",
        user_id: finalUserId,
        promoter_id: finalPromoterId,
        incident_name,
        description,
        hasPhoto: !!photo,
        endpoint: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_INCIDENT}`,
      });

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_INCIDENT}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("[API Response] Create Incident:", {
        status: response.status,
        data,
      });

      if (response.status === 200 && data.incident) {
        const newIncident = data.incident;
        // Add to local state
        setIncidents((prev) => [newIncident, ...prev]);
        return newIncident;
      } else {
        throw new Error(data.message || "Failed to create incident");
      }
    } catch (error: any) {
      const message = error.message || "Failed to create incident";
      setError(message);
      console.error("[API Error] Create Incident:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getIncidents = async (
    filters?: GetIncidentsFilters,
  ): Promise<Incident[] | null> => {
    if (isConnected === false || isInternetReachable === false) {
      return null;
    }
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("token", apiKey || "");
      params.append("user_id", String(user?.user_id || ""));

      console.log("[API GET] Get Incidents Payload:", {
        token: apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING",
        user_id: user?.user_id || "NOT_PROVIDED",
        endpoint: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_INCIDENTS}`,
      });

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_INCIDENTS}?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
      });

      const data = await response.json();
      console.log("[API Response] Get Incidents:", {
        status: response.status,
        data: data,
        total: data.total || data.incidents?.length || 0,
      });

      if (response.status === 200 && data.incidents) {
        setIncidents(data.incidents);
        return data.incidents;
      } else {
        throw new Error(data.message || "Failed to fetch incidents");
      }
    } catch (error: any) {
      const message = error.message || "Failed to fetch incidents";
      setError(message);
      console.error("[API Error] Get Incidents:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveLocations = async (
    filters?: GetActiveLocationsFilters,
  ): Promise<Location[] | null> => {
    try {
      console.log(
        "[API] Get Active Locations - Token value:",
        apiKey ? `${apiKey}...` : "NULL",
      );

      const payload = {
        token: apiKey || "",
        ...(filters || {}),
      };

      const data = await fetchData<any>(
        API_CONFIG.ENDPOINTS.GET_ACTIVE_LOCATIONS,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (data) {
        // Handle both array and object responses
        const locationsList = Array.isArray(data)
          ? data
          : data.locations || data.data || [];
        setLocations(locationsList);
        return locationsList;
      } else {
        return null;
      }
    } catch (error: any) {
      console.error("[API Error] Get Active Locations:", error);
      return null;
    }
  };

  const submitReport = async ({
    title,
    description,
    image,
  }: {
    title: string;
    description: string;
    image?: string | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      if (image) {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("image", {
          uri: image,
          name: `report_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const result = await fetchData<any>(
        API_CONFIG.ENDPOINTS.GET_INCIDENTS || "/reports",
        {
          method: "POST",
          body: formData,
        },
      );

      if (result) {
        // Optionally add to local state if server doesn't re-fetch
        setIncidents((prev) => [
          {
            incident_id: result.id || Date.now().toString(),
            incident_name: title,
            description,
            status: "Pending",
            created_at: "Just now",
            photo: image || undefined,
          },
          ...prev,
        ]);
      }
    } catch (e: any) {
      throw e;
    }
  };

  const savePushToken = async (fcmToken: string) => {
    if (!user?.user_id || !apiKey || isConnected === false || isInternetReachable === false) return false;
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_PUSH_TOKEN || "save_push_token"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            token: apiKey,
            user_id: user.user_id,
            user_token: fcmToken,
          }),
        },
      );
      const data = await response.json().catch(() => ({}));
      console.log("[API Response] Save Push Token:", {
        status: response.status,
        data,
      });
      return response.status === 200;
    } catch (e) {
      console.error("[API Error] Save Push Token:", e);
      return false;
    }
  };

  const setLoading = (loading: boolean) => setIsLoading(loading);

  return (
    <ApiContext.Provider
      value={{
        isLoading,
        setLoading,
        incidents,
        setIncidents,
        locations,
        setLocations,
        createIncident,
        getIncidents,
        getActiveLocations,
        submitReport,
        savePushToken,
        apiError,
        setError,
        fetchData,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
