import { useCallback, useEffect, useState } from "react";
import type { LatLng } from "@promolocation/shared";

type BrowserLocationState = {
  accuracy: number | null;
  coords: LatLng | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
};

export default function useBrowserLocation() {
  const [state, setState] = useState<BrowserLocationState>({
    accuracy: null,
    coords: null,
    error: null,
    isLoading: true,
    isSupported: typeof navigator !== "undefined" && "geolocation" in navigator,
  });

  const [watchSeed, setWatchSeed] = useState(0);

  const retry = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }));
    setWatchSeed((value) => value + 1);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({
        accuracy: null,
        coords: null,
        error: "This browser does not support location access.",
        isLoading: false,
        isSupported: false,
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          accuracy: position.coords.accuracy ?? null,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          isLoading: false,
          isSupported: true,
        });
      },
      (error) => {
        let message = "Unable to get your location.";

        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission was denied in this browser.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your location is currently unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "The location request timed out.";
        }

        setState({
          accuracy: null,
          coords: null,
          error: message,
          isLoading: false,
          isSupported: true,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [watchSeed]);

  return {
    ...state,
    retry,
  };
}
