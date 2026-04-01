import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ApiProvider } from './ApiContext';
import { NetworkProvider } from './NetworkContext';
import NoInternetModal from '@/components/NoInternetModal';

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  return (
    <NetworkProvider>
      <AuthProvider>
        <ApiProvider>
          {children}
          <NoInternetModal />
        </ApiProvider>
      </AuthProvider>
    </NetworkProvider>
  );
};

export { useAuth } from './AuthContext';
export { useApi } from './ApiContext';
export { useNetwork } from './NetworkContext';
