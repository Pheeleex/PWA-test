import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ApiProvider } from './ApiContext';

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ApiProvider>
        {children}
      </ApiProvider>
    </AuthProvider>
  );
};

export { useAuth } from './AuthContext';
export { useApi } from './ApiContext';
