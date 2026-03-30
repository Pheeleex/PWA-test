import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import API_CONFIG from '../constants/Api';

// Common structures for API data
export interface Incident {
  id: string;
  title: string;
  type?: string;
  description: string;
  status: string;
  date: string;
  image?: string;
}

interface ApiContextType {
  // Global loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // General app state tracking (e.g. incidents, reports)
  incidents: Incident[];
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;

  // Error handling
  apiError: string | null;
  setError: (error: string | null) => void;

  // Generic data fetching utility (placeholder)
  fetchData: <T>(endpoint: string, options?: any) => Promise<T | null>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      title: 'Minor Accident',
      date: '2 hours ago',
      status: 'Pending',
      description: 'Two cars collided at the intersection. No injuries reported, but traffic is blocked.',
      image: 'https://picsum.photos/300/200?random=1',
    },
    {
      id: '2',
      title: 'Road Maintenance',
      date: '5 hours ago',
      status: 'In Progress',
      description: 'Road repair work ongoing near the city center. Expect delays.',
      image: 'https://picsum.photos/300/200?random=2',
    },
    {
      id: '3',
      title: 'Security Alert',
      date: '1 day ago',
      status: 'Resolved',
      description: 'Suspicious activity reported. Police investigated and cleared the area.',
      image: 'https://picsum.photos/300/200?random=3',
    },
  ]);
  const [apiError, setError] = useState<string | null>(null);

  const { token, apiKey, logout } = useAuth();

  // Helper for actual fetch calls.
  // This can be used as a shared utility throughout the app.
  const fetchData = async <T,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Handle unauthorized (e.g., logout)
        await logout();
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (e: any) {
      const message = e.message || 'Something went wrong';
      setError(message);
      console.error('API Fetch Error:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addIncident = (incident: Incident) => {
    setIncidents((prev) => [incident, ...prev]);
  };

  const setLoading = (loading: boolean) => setIsLoading(loading);

  return (
    <ApiContext.Provider
      value={{
        isLoading,
        setLoading,
        incidents,
        setIncidents,
        addIncident,
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
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
