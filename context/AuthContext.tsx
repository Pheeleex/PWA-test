import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_CONFIG from "../constants/Api";

interface User {
  user_id: number;
  promoter_id: string;
  email: string;
  fullname: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_role: string;
  avatar: string;
  active: boolean;
  email_verified: boolean;
  is_approved: boolean;
  area?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  apiKey: string | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  login: (credentials: {
    promoter_id: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updatePassword: (passwords: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<void>;
  updateProfile: (
    profileData: Partial<User>,
    imageUri?: string | null,
  ) => Promise<void>;
  resetPassword: (promoter_id: string) => Promise<void>;
  fetchApiKey: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] =
    useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initial load from storage
  useEffect(() => {
    const initialize = async () => {
      try {
        const [storedToken, storedApiKey, onboardingStatus, storedUser] =
          await Promise.all([
            AsyncStorage.getItem("jwt_token"),
            AsyncStorage.getItem("api_key"),
            AsyncStorage.getItem("onboarding_complete"),
            AsyncStorage.getItem("user_data"),
          ]);

        if (storedToken) setToken(storedToken);
        if (storedApiKey) setApiKey(storedApiKey);
        if (onboardingStatus === "true") setIsOnboardingComplete(true);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  const fetchApiKey = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      console.log(`[API GET] Requesting API Key...`);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_API_KEY}`,
      );
      const data = await response.json();
      console.log(`[API Success] API Key retrieved:`, data);
      if (Array.isArray(data) && data.length > 0 && data[0].api_key) {
        const fetchedKey = data[0].api_key;
        setApiKey(fetchedKey);
        await AsyncStorage.setItem("api_key", fetchedKey);
        return fetchedKey;
      }
      return null;
    } catch (error) {
      console.error("[API Error] Failed to fetch API key:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setIsOnboardingComplete(true);
    await AsyncStorage.setItem("onboarding_complete", "true");
  };

  const login = async (credentials: {
    promoter_id: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      let currentApiKey = apiKey;
      if (!currentApiKey) {
        currentApiKey = await fetchApiKey();
      }

      if (!currentApiKey) {
        throw new Error(
          "Unable to retrieve API key. Please check your internet connection.",
        );
      }

      const loginPayload = {
        token: currentApiKey,
        ...credentials,
      };

      console.log("[API POST] Login Request:", {
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        body: loginPayload,
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginPayload),
        },
      );

      const data = await response.json();
      console.log("[API Response] Login:", { status: response.status, data });

      if (response.status === 200 && data.access_token) {
        const access_token = data.access_token;
        setToken(access_token);

        const userData: User = {
          user_id: data.user_id,
          promoter_id: data.promoter_id,
          email: data.email,
          fullname: data.fullname,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          user_role: data.user_role,
          avatar: data.avatar,
          active: data.active,
          email_verified: data.email_verified,
          is_approved: data.is_approved,
        };
        setUser(userData);

        await Promise.all([
          AsyncStorage.setItem("jwt_token", access_token),
          AsyncStorage.setItem("user_data", JSON.stringify(userData)),
        ]);
      } else {
        let errorMsg = data.message || "Login failed";
        if (response.status === 404)
          errorMsg = "No account found with this promoter ID.";
        if (response.status === 400)
          errorMsg = "Invalid credentials. Check your password.";
        if (response.status === 403) errorMsg = "Email not verified.";
        if (response.status === 406)
          errorMsg = "Account pending admin approval.";
        if (response.status === 423) errorMsg = "Account has been deactivated.";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("[API Error] Login:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("[AUTH] Logging out - clearing user, token, and apiKey");
    setUser(null);
    setToken(null);
    setApiKey(null);
    console.log("[AUTH] State cleared");
    await Promise.all([
      AsyncStorage.removeItem("jwt_token"),
      AsyncStorage.removeItem("user_data"),
      AsyncStorage.removeItem("api_key"),
    ]);
    console.log("[AUTH] AsyncStorage cleared");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const updatePassword = async (passwords: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    setIsLoading(true);
    try {
      console.log("[API POST] Update Password Request:", passwords);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            token: apiKey,
            jwt: token,
            ...passwords,
          }),
        },
      );

      const data = await response.json();
      console.log("[API Response] Update Password:", {
        status: response.status,
        data,
      });
      if (response.status !== 200) {
        throw new Error(data.message || "Failed to update password");
      }
    } catch (error: any) {
      console.error("[API Error] Update Password:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    profileData: Partial<User>,
    imageUri?: string | null,
  ) => {
    setIsLoading(true);
    console.log("[DEBUG] updateProfile started", { profileData, hasImage: !!imageUri });

    try {
      if (!apiKey || !token || !user?.user_id) {
        console.error("[DEBUG] Missing session data", { apiKey: !!apiKey, token: !!token, userId: user?.user_id });
        logout()
        throw new Error("Session data missing. Please log in again.");
      }

      const isRemovingImage = imageUri === "delete";
      const hasNewImage = imageUri && !isRemovingImage;

      let response;
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`;
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      // Determine fields to send
      const fields: any = {
        token: apiKey,
        jwt: token,
        user_id: user.user_id,
        ...profileData,
      };

      // Handle fullname splitting if present
      if (profileData.fullname) {
        const parts = profileData.fullname.trim().split(/\s+/);
        fields.first_name = parts[0];
        fields.last_name = parts.slice(1).join(" ") || parts[0];
      }

      if (hasNewImage) {
        // Use FormData for image upload or deletion
        const formData = new FormData();
        Object.keys(fields).forEach((key) => {
          formData.append(key, String(fields[key]));
        });

        if (hasNewImage) {
          const uriParts = imageUri!.split(".");
          const fileType = uriParts[uriParts.length - 1];
          formData.append("avatar", {
            uri: imageUri,
            name: `avatar.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        console.log("[API POST] Update Profile (FormData):", formData);
        response = await fetch(url, {
          method: "POST",
          headers, // No Content-Type for FormData
          body: formData,
        });
      } else {
        // Use JSON for metadata-only updates
        headers["Content-Type"] = "application/json";
        console.log("[API POST] Update Profile (JSON):", fields);
        response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(fields),
        });
      }

      const data = await response.json().catch(() => ({}));
      console.log("[API Response Status]:", response, data);

      if (response.status === 401) {
        console.error("[API Error] Unauthorized in updateProfile");
        await logout();
        throw new Error("Your session has expired. Please log in again.");
      }

      if (response.status === 200) {
        const updatedUser = data.user || data.data || data;
        setUser((prev: User | null) =>
          prev ? { ...prev, ...updatedUser } : (updatedUser as User),
        );
        await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("[API Error] Update Profile Catch:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (promoter_id: string) => {
    setIsLoading(true);
    try {
      let currentApiKey = apiKey;
      if (!currentApiKey) {
        currentApiKey = await fetchApiKey();
      }

      if (!currentApiKey) {
        throw new Error(
          "Unable to retrieve API key. Please check your internet connection.",
        );
      }

      const payload = {
        token: currentApiKey,
        promoter_id,
      };

      console.log("[API POST] Reset Password Request:", {
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`,
        promoter_id,
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      console.log("[API Response] Reset Password:", {
        status: response.status,
        data,
      });

      if (response.status === 200) {
        // Success - password has been reset
        return;
      } else {
        let errorMsg =
          data.message || "Failed to reset password. Please try again.";
        if (response.status === 404) {
          errorMsg = "Promoter ID not found.";
        }
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("[API Error] Reset Password:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        apiKey,
        isAuthenticated,
        isOnboardingComplete,
        isInitialized,
        isLoading,
        login,
        logout,
        completeOnboarding,
        updateUser,
        updatePassword,
        updateProfile,
        resetPassword,
        fetchApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
