import { useEffect, useMemo, useRef, useState } from "react";
import type { AuthenticatedUser } from "@promolocation/shared";
import type {
  ProfileSaveRequest,
  ProfileSaveResult,
} from "../hooks/useOfflineProfileQueue";
import AlertDialog from "./AlertDialog";
import PwaScreenHeader from "./PwaScreenHeader";

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-avatar-action-icon"
      viewBox="0 0 24 24"
    >
      <path d="M4 8.5H20" />
      <path d="M7.5 6.5L8.7 4.8H15.3L16.5 6.5" />
      <path d="M6 6.5H18C19.1 6.5 20 7.4 20 8.5V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V8.5C4 7.4 4.9 6.5 6 6.5Z" />
      <circle cx="12" cy="12.75" r="3.4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-avatar-action-icon"
      viewBox="0 0 24 24"
    >
      <path d="M4.5 7H19.5" />
      <path d="M9.5 10.5V16.5" />
      <path d="M14.5 10.5V16.5" />
      <path d="M7.5 7V18C7.5 19.1 8.4 20 9.5 20H14.5C15.6 20 16.5 19.1 16.5 18V7" />
      <path d="M9.5 4H14.5L15.2 7H8.8L9.5 4Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-lock-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M7.5 10V8C7.5 5.5 9.4 3.8 12 3.8C14.6 3.8 16.5 5.5 16.5 8V10" />
      <path d="M6.5 10H17.5C18.3 10 19 10.7 19 11.5V18.5C19 19.3 18.3 20 17.5 20H6.5C5.7 20 5 19.3 5 18.5V11.5C5 10.7 5.7 10 6.5 10Z" />
    </svg>
  );
}

function PersonPlaceholderIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-avatar-placeholder-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M12 12C14.4 12 16.3 10.1 16.3 7.7C16.3 5.3 14.4 3.4 12 3.4C9.6 3.4 7.7 5.3 7.7 7.7C7.7 10.1 9.6 12 12 12Z" />
      <path d="M4.8 20.6C6.1 16.9 8.8 15.1 12 15.1C15.2 15.1 17.9 16.9 19.2 20.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-image-close-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

type ProfileScreenProps = {
  isOnline: boolean;
  isSyncingQueuedUpdates: boolean;
  onBack: () => void;
  onDeleteProfilePicture: () => Promise<void>;
  onRefreshProfile: () => Promise<void>;
  onSaveProfile: (
    request: ProfileSaveRequest,
  ) => Promise<ProfileSaveResult>;
  onSyncQueuedUpdates: () => Promise<unknown>;
  pendingProfileUpdates: number;
  profileSyncError: string | null;
  session: {
    accessToken: string;
    apiKey: string;
    user: AuthenticatedUser;
  };
};

type ConfirmationDialog = {
  confirmText: string;
  message: string;
  onConfirm: () => void;
  title: string;
  type: "error" | "warning";
};

export default function ProfileScreen({
  isOnline,
  isSyncingQueuedUpdates,
  onBack,
  onDeleteProfilePicture,
  onRefreshProfile,
  onSaveProfile,
  onSyncQueuedUpdates,
  pendingProfileUpdates,
  profileSyncError,
  session,
}: ProfileScreenProps) {
  const [fullname, setFullname] = useState(session.user.fullname || "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(
    null,
  );
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isViewingAvatar, setIsViewingAvatar] = useState(false);
  const [hasAvatarLoadError, setHasAvatarLoadError] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    message: string;
    title: string;
    type: "success" | "error";
  }>({
    message: "",
    title: "",
    type: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog | null>(
    null,
  );
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    setFullname(session.user.fullname || "");
  }, [session.user.fullname]);

  useEffect(() => {
    if (!pendingAvatarFile) {
      setPendingAvatarPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(pendingAvatarFile);
    setPendingAvatarPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [pendingAvatarFile]);

  const currentDisplayImage = useMemo(() => {
    return pendingAvatarPreview || session.user.avatar || "";
  }, [pendingAvatarPreview, session.user.avatar]);

  const formattedDisplayImage = useMemo(() => {
    if (!currentDisplayImage) {
      return "";
    }

    if (
      currentDisplayImage.startsWith("http") ||
      currentDisplayImage.startsWith("blob:") ||
      currentDisplayImage.startsWith("data:")
    ) {
      return currentDisplayImage;
    }

    return `https://promolocation.nubiaville.com/${
      currentDisplayImage.startsWith("/")
        ? currentDisplayImage.slice(1)
        : currentDisplayImage
    }`;
  }, [currentDisplayImage]);

  const hasChanges = useMemo(() => {
    return fullname.trim() !== (session.user.fullname || "").trim() || pendingAvatarFile !== null;
  }, [fullname, pendingAvatarFile, session.user.fullname]);

  useEffect(() => {
    setHasAvatarLoadError(false);
  }, [formattedDisplayImage]);

  useEffect(() => {
    if (!hasChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error",
  ) => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const isRefreshBusy = isRefreshing || isPullRefreshing;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showAlert("Invalid File", "Please choose an image file.", "error");
      return;
    }

    setPendingAvatarFile(file);
    event.target.value = "";
  };

  const handleBack = () => {
    if (isViewingAvatar) {
      setIsViewingAvatar(false);
      return;
    }

    if (!hasChanges) {
      onBack();
      return;
    }

    setConfirmDialog({
      confirmText: "Leave",
      message: "You have unsaved changes. Are you sure you want to leave?",
      onConfirm: () => {
        setConfirmDialog(null);
        onBack();
      },
      title: "Discard Changes?",
      type: "warning",
    });
  };

  const handleRefresh = async () => {
    if (hasChanges) {
      showAlert(
        "Unsaved Changes",
        "Please save or discard your changes before refreshing your profile.",
        "error",
      );
      return;
    }

    setIsRefreshing(true);

    try {
      await onRefreshProfile();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to refresh profile. Please try again.";
      showAlert("Refresh Failed", message, "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePullStart = (event: React.TouchEvent<HTMLElement>) => {
    if (
      window.scrollY > 0 ||
      hasChanges ||
      isRefreshBusy ||
      isSaving ||
      isViewingAvatar
    ) {
      return;
    }

    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handlePullMove = (event: React.TouchEvent<HTMLElement>) => {
    const startY = touchStartYRef.current;

    if (startY === null) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? startY;
    const distance = currentY - startY;

    if (distance <= 0) {
      setPullDistance(0);
      return;
    }

    setPullDistance(Math.min(distance * 0.45, 96));
  };

  const handlePullEnd = () => {
    const shouldRefresh = pullDistance >= 64;
    touchStartYRef.current = null;

    if (!shouldRefresh) {
      setPullDistance(0);
      return;
    }

    setIsPullRefreshing(true);
    setPullDistance(72);

    void handleRefresh().finally(() => {
      setIsPullRefreshing(false);
      setPullDistance(0);
    });
  };

  const handlePullCancel = () => {
    touchStartYRef.current = null;
    setPullDistance(0);
  };

  const performDeletePicture = async () => {
    setIsDeletingImage(true);

    try {
      await onDeleteProfilePicture();
      setPendingAvatarFile(null);
      showAlert("Success", "Profile picture removed successfully.", "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete profile picture.";
      showAlert("Error", message, "error");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleDeletePicture = () => {
    setConfirmDialog({
      confirmText: "Remove",
      message: "Are you sure you want to remove your profile picture?",
      onConfirm: () => {
        setConfirmDialog(null);
        void performDeletePicture();
      },
      title: "Remove Profile Picture?",
      type: "error",
    });
  };

  const handleSave = async () => {
    const normalizedFullname = fullname.trim();

    if (!normalizedFullname) {
      showAlert("Error", "Full Name is required.", "error");
      return;
    }

    const nameParts = normalizedFullname.split(/\s+/);

    if (nameParts.length < 2) {
      showAlert(
        "Error",
        "Full Name must contain First and Last name.",
        "error",
      );
      return;
    }

    if (normalizedFullname.length < 3) {
      showAlert(
        "Error",
        "Full Name must be at least 3 characters long.",
        "error",
      );
      return;
    }

    setIsSaving(true);

    try {
      const result = await onSaveProfile({
        avatarFile: pendingAvatarFile,
        fullname: normalizedFullname,
      });

      setPendingAvatarFile(null);
      showAlert(
        result.status === "queued" ? "Saved Offline" : "Success",
        result.message,
        "success",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      showAlert("Error", message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      className="screen-shell"
      onTouchCancel={handlePullCancel}
      onTouchEnd={handlePullEnd}
      onTouchMove={handlePullMove}
      onTouchStart={handlePullStart}
    >
      {pullDistance > 0 || isPullRefreshing ? (
        <div
          className={`profile-pull-refresh ${
            pullDistance >= 64 ? "profile-pull-refresh-ready" : ""
          }`}
        >
          {isPullRefreshing
            ? "Refreshing..."
            : pullDistance >= 64
              ? "Release to refresh"
              : "Pull to refresh"}
        </div>
      ) : null}

      <div className="mobile-page-card profile-page-card">
        <PwaScreenHeader
          onBack={handleBack}
          showBackButton
          title="Profile"
        />

        <section className="profile-screen-content">
          <div className="profile-header-section">
            <div className="profile-avatar-shell">
              <button
                className={`profile-avatar-button ${!currentDisplayImage ? "profile-avatar-placeholder" : ""}`}
                disabled={!formattedDisplayImage || hasAvatarLoadError}
                onClick={() =>
                  formattedDisplayImage && !hasAvatarLoadError && setIsViewingAvatar(true)
                }
                type="button"
              >
                {formattedDisplayImage && !hasAvatarLoadError ? (
                  <img
                    alt={session.user.fullname || "Promoter avatar"}
                    className="profile-avatar-image"
                    onError={() => setHasAvatarLoadError(true)}
                    src={formattedDisplayImage}
                  />
                ) : (
                  <span className="profile-avatar-fallback">
                    <PersonPlaceholderIcon />
                  </span>
                )}
              </button>

              <div className="profile-avatar-actions">
                <label className="profile-camera-badge">
                  <span className="sr-only">Change profile picture</span>
                  <CameraIcon />
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                    type="file"
                  />
                </label>

                <button
                  aria-label="Delete profile picture"
                  className="profile-delete-badge"
                  disabled={!currentDisplayImage || isDeletingImage}
                  onClick={() => void handleDeletePicture()}
                  type="button"
                >
                  {isDeletingImage ? (
                    <span className="profile-avatar-action-spinner">...</span>
                  ) : (
                    <TrashIcon />
                  )}
                </button>
              </div>
            </div>

            <h2 className="profile-name-heading">
              {session.user.fullname || "Promoter"}
            </h2>

            {pendingAvatarFile ? (
              <span className="profile-pending-badge">Unsaved Changes</span>
            ) : null}
          </div>

          {!isOnline ? (
            <section className="profile-sync-card profile-sync-card-offline">
              <div>
                <strong>Offline profile editing is on</strong>
                <p>
                  Name and avatar changes will be saved on this device and sent
                  as soon as the connection comes back.
                </p>
              </div>
            </section>
          ) : null}

          {pendingProfileUpdates > 0 ? (
            <section
              className={`profile-sync-card ${
                profileSyncError
                  ? "profile-sync-card-error"
                  : "profile-sync-card-pending"
              }`}
            >
              <div>
                <strong>
                  {isSyncingQueuedUpdates
                    ? "Syncing your saved profile change"
                    : pendingProfileUpdates === 1
                      ? "1 saved profile change is waiting to sync"
                      : `${pendingProfileUpdates} saved profile changes are waiting to sync`}
                </strong>
                <p>
                  {profileSyncError
                    ? profileSyncError
                    : isOnline
                      ? "We will keep retrying automatically while this app is open."
                      : "Your change is safe on this device until you reconnect."}
                </p>
              </div>

              {isOnline ? (
                <button
                  className="ghost-outline profile-sync-action"
                  disabled={isSyncingQueuedUpdates}
                  onClick={() => void onSyncQueuedUpdates()}
                  type="button"
                >
                  {isSyncingQueuedUpdates ? "Syncing..." : "Sync now"}
                </button>
              ) : null}
            </section>
          ) : null}

          <section className="profile-details-card">
            <div className="profile-readonly-card">
              <div className="profile-label-row">
                <span className="profile-detail-label">Promoter Code</span>
                <span className="profile-lock-tag">
                  <LockIcon />
                </span>
              </div>
              <strong>{session.user.promoter_id}</strong>
            </div>

            <label className="mobile-field profile-name-field">
              <span>Full Name</span>
              <input
                className="mobile-input profile-name-input"
                onChange={(event) => setFullname(event.target.value)}
                placeholder="Enter your full name"
                value={fullname}
              />
            </label>

            <div
              className={`profile-readonly-card profile-status-card ${
                session.user.active
                  ? "profile-status-card-active"
                  : "profile-status-card-inactive"
              }`}
            >
              <div className="profile-label-row">
                <span className="profile-detail-label">Status</span>
                <span className="profile-lock-tag">
                  <LockIcon />
                </span>
              </div>
              <strong
                className={
                  session.user.active
                    ? "profile-status-active"
                    : "profile-status-inactive"
                }
              >
                {session.user.active ? "Active" : "Inactive"}
              </strong>
            </div>
          </section>

          <button
            className="fixed-width-primary profile-update-button"
            disabled={!hasChanges || isSaving}
            onClick={() => void handleSave()}
            type="button"
          >
            {isSaving
              ? isOnline
                ? "Updating..."
                : "Saving offline..."
              : isOnline
                ? "Update Profile"
                : "Save Offline"}
          </button>
        </section>
      </div>

      {isViewingAvatar && formattedDisplayImage && !hasAvatarLoadError ? (
        <div
          aria-modal="true"
          className="modal-backdrop profile-image-backdrop"
          onClick={() => setIsViewingAvatar(false)}
          role="dialog"
        >
          <div
            className="profile-image-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Close image preview"
              className="profile-image-close-button"
              onClick={() => setIsViewingAvatar(false)}
              type="button"
            >
              <CloseIcon />
            </button>
            <img
              alt={session.user.fullname || "Promoter avatar"}
              className="profile-image-modal-image"
              onError={() => setHasAvatarLoadError(true)}
              src={formattedDisplayImage}
            />
          </div>
        </div>
      ) : null}

      <AlertDialog
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        title={alertConfig.title}
        type={alertConfig.type}
        visible={alertVisible}
      />

      {confirmDialog ? (
        <AlertDialog
          cancelText="Cancel"
          confirmText={confirmDialog.confirmText}
          message={confirmDialog.message}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          showCancel
          title={confirmDialog.title}
          type={confirmDialog.type}
          visible
        />
      ) : null}
    </main>
  );
}
