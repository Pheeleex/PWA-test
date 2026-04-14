import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  decorateZonesWithDistance,
  fetchActiveLocations,
  fetchApiKey,
  getHeadingDirection,
  getNearestZone,
  getZoneDistanceLabel,
  mapLocationsToActivationZones,
  type ApiLocation,
  type AuthenticatedUser,
} from "@promolocation/shared";
import ActivationQrModal from "./ActivationQrModal";
import LeafletActivationMap from "./LeafletActivationMap";
import useBrowserLocation from "../hooks/useBrowserLocation";

type ActivationMapScreenProps = {
  isOnline: boolean;
  onOpenChangePassword: () => void;
  onSessionPatch: (session: {
    accessToken?: string;
    apiKey?: string;
    user?: AuthenticatedUser;
  }) => void;
  session: {
    accessToken: string;
    apiKey: string;
    user: AuthenticatedUser;
  };
};

const GPS_ACCURACY_THRESHOLD = 30;
const ACTIVATION_ZONE_CACHE_KEY = "promolocation-pwa-activation-zones";

type CachedActivationZones = {
  savedAt: string;
  zones: ApiLocation[];
};

function formatSavedTime(savedAt: string) {
  const timestamp = new Date(savedAt);

  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readCachedZones(): CachedActivationZones | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(ACTIVATION_ZONE_CACHE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<CachedActivationZones>;

    if (!Array.isArray(parsedValue.zones) || typeof parsedValue.savedAt !== "string") {
      return null;
    }

    return {
      savedAt: parsedValue.savedAt,
      zones: parsedValue.zones,
    };
  } catch {
    return null;
  }
}

function writeCachedZones(zones: ApiLocation[]) {
  if (typeof window === "undefined") {
    return;
  }

  const cacheRecord: CachedActivationZones = {
    savedAt: new Date().toISOString(),
    zones,
  };

  window.localStorage.setItem(
    ACTIVATION_ZONE_CACHE_KEY,
    JSON.stringify(cacheRecord),
  );
}

export default function ActivationMapScreen({
  isOnline,
  onOpenChangePassword,
  onSessionPatch,
  session,
}: ActivationMapScreenProps) {
  const [zones, setZones] = useState<ApiLocation[]>([]);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [fitAllSignal, setFitAllSignal] = useState(0);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [zonesNotice, setZonesNotice] = useState<string | null>(null);
  const previousOnlineRef = useRef(isOnline);

  const location = useBrowserLocation();

  useEffect(() => {
    const cachedZones = readCachedZones();

    if (!cachedZones || cachedZones.zones.length === 0) {
      return;
    }

    setZones(cachedZones.zones);
    setLastUpdated(formatSavedTime(cachedZones.savedAt));
    setZonesNotice("Showing the last synced activation zones while we refresh.");
  }, []);

  const loadZones = useCallback(async () => {
    setIsLoadingZones(true);
    setZonesError(null);
    setZonesNotice(null);

    try {
      let apiKey = session.apiKey;

      if (!apiKey) {
        apiKey = await fetchApiKey();
        onSessionPatch({ apiKey });
      }

      const activeLocations = await fetchActiveLocations(apiKey);
      setZones(activeLocations);
      writeCachedZones(activeLocations);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (error) {
      const cachedZones = readCachedZones();

      if (cachedZones && cachedZones.zones.length > 0) {
        setZones(cachedZones.zones);
        setLastUpdated(formatSavedTime(cachedZones.savedAt));
        setZonesNotice(
          `Offline snapshot loaded${formatSavedTime(cachedZones.savedAt) ? ` from ${formatSavedTime(cachedZones.savedAt)}` : ""}.`,
        );
      } else {
        const message =
          error instanceof Error ? error.message : "Unable to load activation zones.";
        setZonesError(message);
      }
    } finally {
      setIsLoadingZones(false);
    }
  }, [onSessionPatch, session.apiKey]);

  useEffect(() => {
    void loadZones();
  }, [loadZones]);

  useEffect(() => {
    if (isOnline && !previousOnlineRef.current) {
      void loadZones();
    }

    previousOnlineRef.current = isOnline;
  }, [isOnline, loadZones]);

  const mappedZones = useMemo(
    () => mapLocationsToActivationZones(zones),
    [zones],
  );

  const activationZonesWithDistance = useMemo(
    () => decorateZonesWithDistance(mappedZones, location.coords),
    [location.coords, mappedZones],
  );

  const activeZone = useMemo(() => {
    const insideZones = activationZonesWithDistance.filter((zone) => zone.isInside);

    if (!insideZones.length) {
      return null;
    }

    return insideZones.reduce((closestZone, zone) => {
      if ((zone.centerDistance ?? Number.POSITIVE_INFINITY) < (closestZone.centerDistance ?? Number.POSITIVE_INFINITY)) {
        return zone;
      }

      return closestZone;
    });
  }, [activationZonesWithDistance]);

  const nearestGreenZone = useMemo(
    () => getNearestZone(activationZonesWithDistance, "green"),
    [activationZonesWithDistance],
  );

  const activeGreenZone = useMemo(() => {
    const insideGreenZones = activationZonesWithDistance.filter(
      (zone) => zone.isInside && zone.type !== "red",
    );

    if (!insideGreenZones.length) {
      return null;
    }

    return insideGreenZones.reduce((closestZone, zone) => {
      if (
        (zone.centerDistance ?? Number.POSITIVE_INFINITY) <
        (closestZone.centerDistance ?? Number.POSITIVE_INFINITY)
      ) {
        return zone;
      }

      return closestZone;
    });
  }, [activationZonesWithDistance]);

  const sortedGreenZones = useMemo(
    () =>
      activationZonesWithDistance
        .filter((zone) => zone.type === "green")
        .sort(
          (firstZone, secondZone) =>
            (firstZone.distanceToZone ?? Number.POSITIVE_INFINITY) -
            (secondZone.distanceToZone ?? Number.POSITIVE_INFINITY),
        ),
    [activationZonesWithDistance],
  );

  const nearestHeading = useMemo(() => {
    if (!location.coords || !nearestGreenZone) {
      return null;
    }

    return getHeadingDirection(location.coords, nearestGreenZone.center);
  }, [location.coords, nearestGreenZone]);

  const isGpsReliable =
    location.accuracy !== null && location.accuracy <= GPS_ACCURACY_THRESHOLD;

  const activePromoImageUrl = useMemo(() => {
    const rawUrl = session.user.promo_URL;

    if (typeof rawUrl !== "string") {
      return "";
    }

    return rawUrl.trim();
  }, [session.user.promo_URL]);

  const activePromoCode = useMemo(() => {
    const rawPromoCode = session.user.promo_code;

    if (typeof rawPromoCode !== "string") {
      return "";
    }

    return rawPromoCode.trim();
  }, [session.user.promo_code]);

  const qrState = useMemo(() => {
    if (location.isLoading) {
      return {
        buttonLabel: "Checking location...",
        canOpen: false,
        detail: "We need your current browser location before we can unlock scan to activate.",
        title: "Waiting for location",
      };
    }

    if (location.error) {
      return {
        buttonLabel: "Location required",
        canOpen: false,
        detail: "Allow browser location access to check whether the QR is available.",
        title: "Location blocked",
      };
    }

    if (activeZone?.type === "red" && !activeGreenZone) {
      return {
        buttonLabel: "Locked - red zone",
        canOpen: false,
        detail: "You are inside a restricted red zone, so scan to activate stays locked.",
        title: "Restricted area",
      };
    }

    if (activeGreenZone && !isGpsReliable) {
      return {
        buttonLabel: "Improve GPS",
        canOpen: false,
        detail: "You are in a green zone, but the GPS fix is too weak to safely unlock scan to activate.",
        title: "GPS too weak",
      };
    }

    if (activeGreenZone) {
      return {
        buttonLabel: "Scan to activate",
        canOpen: true,
        detail: `You are inside ${activeGreenZone.name}. Scan to activate is ready.`,
        title: "Activation ready",
      };
    }

    return {
      buttonLabel: "Locked - enter a zone",
      canOpen: false,
      detail: "Move into a green activation zone to unlock scan to activate.",
      title: "Activation locked",
    };
  }, [
    activeGreenZone,
    activeZone?.type,
    isGpsReliable,
    location.error,
    location.isLoading,
  ]);

  useEffect(() => {
    if (!qrState.canOpen && isQrOpen) {
      setIsQrOpen(false);
    }
  }, [isQrOpen, qrState.canOpen]);

  const status = useMemo(() => {
    if (activeZone?.type === "red") {
      return {
        detail: "You are currently inside a restricted zone.",
        tone: "danger",
        title: "Inside red zone",
      };
    }

    if (activeZone && isGpsReliable) {
      return {
        detail: "You are within a valid activation zone.",
        tone: "success",
        title: "Inside green zone",
      };
    }

    if (activeZone && !isGpsReliable) {
      return {
        detail: "Your GPS accuracy is weak, so zone detection may be unreliable.",
        tone: "warning",
        title: "GPS signal too weak",
      };
    }

    return {
      detail: "Move closer to a green activation zone to unlock nearby activity.",
      tone: "neutral",
      title: "Outside all zones",
    };
  }, [activeZone, isGpsReliable]);

  const statusDotClass = useMemo(() => {
    if (status.tone === "success") {
      return "status-green";
    }

    if (status.tone === "warning") {
      return "status-amber";
    }

    if (status.tone === "danger") {
      return "status-red";
    }

    return "status-slate";
  }, [status.tone]);

  const statusMessage = useMemo(() => {
    if (activeGreenZone && isGpsReliable) {
      return `You are in ${activeGreenZone.name}. Scan to activate is ready.`;
    }

    if (activeGreenZone && !isGpsReliable) {
      return `Inside ${activeGreenZone.name}, but GPS needs a cleaner fix before scan to activate can open.`;
    }

    if (activeZone?.type === "red") {
      return "You are in a restricted area. Leave the red zone to unlock activity.";
    }

    if (nearestGreenZone) {
      const direction = nearestHeading ? ` Head ${nearestHeading}.` : "";
      return `Nearest: ${nearestGreenZone.name} — ${getZoneDistanceLabel(nearestGreenZone)}.${direction}`;
    }

    return "Finding nearby activation zones...";
  }, [
    activeGreenZone,
    activeZone?.type,
    isGpsReliable,
    nearestGreenZone,
    nearestHeading,
  ]);

  const mapQrButtonLabel = qrState.canOpen
    ? "Scan to activate"
    : qrState.title === "Restricted area"
      ? "Locked - red zone"
      : qrState.buttonLabel;

  return (
    <main className="map-screen-layout">
      <section className="map-screen-viewport">
        <div className="map-frame map-stage map-frame-fullscreen">
          <div className="map-top-overlay">
            <div className="status-row">
              <div className="map-status-title-group">
                <span className={`status-dot ${statusDotClass}`} />
                <span className="map-status-title">{status.title}</span>
              </div>
              {location.accuracy !== null ? (
                <span className={`gps-chip ${!isGpsReliable ? "gps-chip-weak" : ""}`}>
                  GPS ±{Math.round(location.accuracy)}m
                </span>
              ) : null}
            </div>
            <p className="map-status-message">{statusMessage}</p>
          </div>

          <div className="map-action-col">
            <button className="map-fab map-fab-icon" onClick={() => void loadZones()} type="button">
              {isLoadingZones ? "..." : "↻"}
            </button>
            <button
              className="map-fab"
              onClick={() => setRecenterSignal((value) => value + 1)}
              type="button"
            >
              Center on me
            </button>
            <button
              className="map-fab"
              onClick={() => setFitAllSignal((value) => value + 1)}
              type="button"
            >
              All zones
            </button>
          </div>

          <button
            className={`map-qr-button ${!qrState.canOpen ? "map-qr-button-disabled" : ""}`}
            disabled={!qrState.canOpen}
            onClick={() => setIsQrOpen(true)}
            type="button"
          >
            {mapQrButtonLabel}
          </button>

          <div className="map-shell-inner">
            <LeafletActivationMap
              accuracy={location.accuracy}
              currentLocation={location.coords}
              fitAllSignal={fitAllSignal}
              highlightedZoneId={nearestGreenZone?.id ?? activeZone?.id ?? null}
              recenterSignal={recenterSignal}
              zones={activationZonesWithDistance}
            />
          </div>
        </div>
      </section>

      <section className="map-panels-shell">
        {session.user.resetKey === "Yes" ? (
          <section className="notice-banner">
            <strong>Password update recommended.</strong> Your account indicates a
            reset is still pending. The map remains available while we wire the
            rest of the PWA account flow.
          </section>
        ) : null}

        <section className="map-info-grid">
          <article className={`card-panel status-panel tone-${status.tone}`}>
            <div className="card-header">
              <h2>Zone status</h2>
              <span className={`status-pill pill-${status.tone}`}>
                {status.title}
              </span>
            </div>
            <p>{status.detail}</p>
          </article>

          <article className="card-panel">
            <div className="card-header">
              <h2>Live location</h2>
              <button className="ghost-button" onClick={location.retry} type="button">
                Retry
              </button>
            </div>

            {location.isLoading ? (
              <p className="muted">Requesting browser location...</p>
            ) : location.error ? (
              <p className="form-error">{location.error}</p>
            ) : location.coords ? (
              <dl className="stats-grid">
                <div>
                  <dt>Latitude</dt>
                  <dd>{location.coords.latitude.toFixed(6)}</dd>
                </div>
                <div>
                  <dt>Longitude</dt>
                  <dd>{location.coords.longitude.toFixed(6)}</dd>
                </div>
                <div>
                  <dt>GPS</dt>
                  <dd>{isGpsReliable ? "Reliable" : "Watch accuracy"}</dd>
                </div>
                <div>
                  <dt>Browser support</dt>
                  <dd>{location.isSupported ? "Available" : "Unavailable"}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted">Waiting for the first location update...</p>
            )}
          </article>

          <article className="card-panel">
            <div className="card-header">
              <h2>Activation zones</h2>
              <button className="ghost-button" onClick={() => void loadZones()} type="button">
                {isLoadingZones ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {zonesError ? <p className="form-error">{zonesError}</p> : null}
            <p className="muted">
              {isLoadingZones
                ? "Loading red and green zones from the live API..."
                : `${activationZonesWithDistance.length} zones loaded${lastUpdated ? ` · Updated ${lastUpdated}` : ""}.`}
            </p>
            {zonesNotice ? <p className="inline-note">{zonesNotice}</p> : null}

            {nearestGreenZone ? (
              <div className="nearest-card">
                <p className="eyebrow">Nearest green zone</p>
                <h3>{nearestGreenZone.name}</h3>
                <p>{getZoneDistanceLabel(nearestGreenZone)}</p>
                {nearestHeading ? (
                  <p className="muted">Head {nearestHeading}.</p>
                ) : null}
              </div>
            ) : null}
          </article>

          <article className="card-panel">
            <div className="card-header">
              <h2>Quick actions</h2>
              <span className="stat-tag">Mobile parity</span>
            </div>
            <div className="quick-action-stack">
              <button
                className="quick-action-button"
                onClick={onOpenChangePassword}
                type="button"
              >
                Change password
              </button>
            </div>
          </article>

          <article className="card-panel">
            <h2>Green zone distances</h2>
            {sortedGreenZones.length === 0 ? (
              <p className="muted">No green zones are available yet.</p>
            ) : (
              <div className="zone-stack">
                {sortedGreenZones.map((zone) => (
                  <article className="zone-item" key={zone.id}>
                    <div>
                      <strong>{zone.name}</strong>
                      <p className="muted">
                        {zone.isInside ? "Inside zone" : getZoneDistanceLabel(zone)}
                      </p>
                    </div>
                    <span className="stat-tag">{Math.round(zone.radius)}m radius</span>
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>
      </section>

      {isQrOpen && activeGreenZone ? (
        <ActivationQrModal
          onClose={() => setIsQrOpen(false)}
          promoCode={activePromoCode}
          promoImageUrl={activePromoImageUrl}
          zoneName={activeGreenZone.name}
        />
      ) : null}
    </main>
  );
}
