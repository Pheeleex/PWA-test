import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import API_CONFIG from "../constants/Api";

// Common structures for API data
export interface Incident {
  incident_id?: string | number;
  id?: string;
  incident_name?: string;
  title?: string;
  issue_category?: string;
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
}

interface CreateIncidentPayload {
  incident_name: string;
  issue_category?: string;
  description?: string;
  photo?: string | null;
  user_id?: string | number; // Required if user is not logged in
  promoter_id?: string; // Required if user is not logged in
}

interface GetIncidentsFilters {
  incident_id?: string | number;
  status?: "Pending" | "In Progress" | "Resolved";
  issue_category?: string;
}

interface GetActiveLocationsFilters {
  id?: string | number;
  category?: string;
  city?: string;
  search?: string;
}

interface ApiContextType {
  // Global loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // General app state tracking (incidents, reports, locations)
  incidents: Incident[];
  setIncidents: (incidents: Incident[]) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;

  // Incident management
  createIncident: (
    reportContent: CreateIncidentPayload,
  ) => Promise<Incident | null>;
  getIncidents: (filters?: GetIncidentsFilters) => Promise<Incident[] | null>;

  // Location management
  getActiveLocations: (
    filters?: GetActiveLocationsFilters,
  ) => Promise<Location[] | null>;

  // Report submission (legacy)
  submitReport: (reportContent: {
    title: string;
    description: string;
    image?: string | null;
  }) => Promise<void>;

  // Error handling
  apiError: string | null;
  setError: (error: string | null) => void;

  // Generic data fetching utility (placeholder)
  fetchData: <T>(endpoint: string, options?: any) => Promise<T | null>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      incident_id: "1",
      incident_name: "Minor Accident",
      created_at: "2 hours ago",
      status: "Pending",
      description:
        "Two cars collided at the intersection. No injuries reported, but traffic is blocked.",
      photo: "https://picsum.photos/300/200?random=1",
    },
    {
      incident_id: "2",
      incident_name: "Road Maintenance",
      created_at: "5 hours ago",
      status: "In Progress",
      description:
        "Road repair work ongoing near the city center. Expect delays.",
      photo: "https://picsum.photos/300/200?random=2",
    },
    {
      incident_id: "3",
      incident_name: "Security Alert",
      created_at: "1 day ago",
      status: "Resolved",
      description:
        "Suspicious activity reported. Police investigated and cleared the area.",
      photo: "https://picsum.photos/300/200?random=3",
    },
  ]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [apiError, setError] = useState<string | null>(null);

  const { token, apiKey, logout, user } = useAuth();

  // Helper for actual fetch calls.
  // This can be used as a shared utility throughout the app.
  const fetchData = async <T,>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T | null> => {
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
        await logout();
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

  /**
   * Create a new incident report
   * POST /api/create_incident
   * user_id and promoter_id come from logged-in user OR provided manually via form
   */
  const createIncident = async ({
    incident_name,
    issue_category,
    description,
    photo,
    user_id: payloadUserId,
    promoter_id: payloadPromoterId,
  }: CreateIncidentPayload): Promise<Incident | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine user_id and promoter_id (logged-in user takes precedence)
      const finalUserId = user?.user_id || payloadUserId;
      const finalPromoterId = user?.promoter_id || payloadPromoterId;

      const formData = new FormData();
      formData.append("token", apiKey || "");
      if (finalUserId) formData.append("user_id", String(finalUserId));
      if (finalPromoterId) formData.append("promoter_id", finalPromoterId);
      formData.append("incident_name", incident_name);

      if (issue_category) {
        formData.append("issue_category", issue_category);
      }
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

      console.log("[API POST] Create Incident Request:", {
        incident_name,
        issue_category,
        description,
        hasPhoto: !!photo,
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

  /**
   * Get incident reports with optional filters
   * GET/POST /api/get_incidents
   * REQUIRED: token, user_id
   * OPTIONAL: incident_id, status, issue_category
   */
  const getIncidents = async (
    filters?: GetIncidentsFilters,
  ): Promise<Incident[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("token", apiKey || "");
      formData.append("user_id", String(user?.user_id || ""));

      if (filters?.incident_id) {
        formData.append("incident_id", String(filters.incident_id));
      }
      if (filters?.status) {
        formData.append("status", filters.status);
      }
      if (filters?.issue_category) {
        formData.append("issue_category", filters.issue_category);
      }

      console.log("[API POST] Get Incidents Request:", filters || "No filters");

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_INCIDENTS}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("[API Response] Get Incidents:", {
        status: response.status,
        total: data.total,
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

  /**
   * Get active locations
   * GET/POST /api/activate_location
   * Retrieves all ACTIVE locations (is_active = 1)
   * REQUIRED: token
   * OPTIONAL: id, category, city, search
   */
  const getActiveLocations = async (
    filters?: GetActiveLocationsFilters,
  ): Promise<Location[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("token", apiKey || "");

      if (filters?.id) {
        formData.append("id", String(filters.id));
      }
      if (filters?.category) {
        formData.append("category", filters.category);
      }
      if (filters?.city) {
        formData.append("city", filters.city);
      }
      if (filters?.search) {
        formData.append("search", filters.search);
      }

      console.log(
        "[API POST] Get Active Locations Request:",
        filters || "No filters",
      );

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ACTIVE_LOCATIONS}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("[API Response] Get Active Locations:", {
        status: response.status,
        total: Array.isArray(data) ? data.length : data.locations?.length || 0,
      });

      if (response.status === 200) {
        // Handle both array and object responses
        const locationsList = Array.isArray(data)
          ? data
          : data.locations || data.data || [];
        setLocations(locationsList);
        return locationsList;
      } else {
        throw new Error(data.message || "Failed to fetch locations");
      }
    } catch (error: any) {
      const message = error.message || "Failed to fetch locations";
      setError(message);
      console.error("[API Error] Get Active Locations:", error);
      return null;
    } finally {
      setIsLoading(false);
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
