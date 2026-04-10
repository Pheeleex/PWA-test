import { useEffect, useState } from "react";

type NetworkStatusState = {
  isOnline: boolean;
  lastChangedAt: string | null;
};

function getInitialOnlineState() {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine;
}

export default function useNetworkStatus() {
  const [state, setState] = useState<NetworkStatusState>(() => ({
    isOnline: getInitialOnlineState(),
    lastChangedAt: null,
  }));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateStatus = (isOnline: boolean) => {
      setState((currentState) => {
        if (currentState.isOnline === isOnline) {
          return currentState;
        }

        return {
          isOnline,
          lastChangedAt: new Date().toISOString(),
        };
      });
    };

    const handleOnline = () => updateStatus(true);
    const handleOffline = () => updateStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return state;
}
