type ConnectivityBannerProps = {
  isOnline: boolean;
  isSyncingProfileUpdates: boolean;
  lastSyncError: string | null;
  pendingProfileUpdates: number;
};

export default function ConnectivityBanner({
  isOnline,
  isSyncingProfileUpdates,
  lastSyncError,
  pendingProfileUpdates,
}: ConnectivityBannerProps) {
  const queuedLabel =
    pendingProfileUpdates === 1
      ? "1 saved profile change"
      : `${pendingProfileUpdates} saved profile changes`;

  if (!isOnline) {
    return (
      <div
        aria-live="polite"
        className="connectivity-banner connectivity-banner-offline"
        role="status"
      >
        <span className="connectivity-banner-indicator" />
        <p>
          {pendingProfileUpdates > 0
            ? `Offline mode. ${queuedLabel} will sync automatically when you reconnect.`
            : "Offline mode. Parts of the app you've already opened remain available on this device."}
        </p>
      </div>
    );
  }

  if (isSyncingProfileUpdates) {
    return (
      <div
        aria-live="polite"
        className="connectivity-banner connectivity-banner-syncing"
        role="status"
      >
        <span className="connectivity-banner-indicator" />
        <p>Back online. Syncing your saved profile changes now.</p>
      </div>
    );
  }

  if (pendingProfileUpdates > 0) {
    return (
      <div
        aria-live="polite"
        className="connectivity-banner connectivity-banner-pending"
        role="status"
      >
        <span className="connectivity-banner-indicator" />
        <p>
          {lastSyncError
            ? `${queuedLabel} still need attention before they can sync. Open Profile to review.`
            : `${queuedLabel} are still waiting to sync.`}
        </p>
      </div>
    );
  }

  return null;
}
