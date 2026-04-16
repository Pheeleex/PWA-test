import { useEffect, useMemo, useState } from "react";
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

  const hasChanges = useMemo(() => {
    return fullname.trim() !== (session.user.fullname || "").trim() || pendingAvatarFile !== null;
  }, [fullname, pendingAvatarFile, session.user.fullname]);

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

    const shouldLeave = window.confirm(
      "You have unsaved changes. Are you sure you want to leave?",
    );

    if (shouldLeave) {
      onBack();
    }
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

  const handleDeletePicture = async () => {
    const shouldDelete = window.confirm(
      "Are you sure you want to remove your profile picture?",
    );

    if (!shouldDelete) {
      return;
    }

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
    <main className="screen-shell">
      <div className="mobile-page-card">
        <PwaScreenHeader
          onBack={handleBack}
          rightSlot={(
            <button
              aria-label="Refresh profile"
              className="profile-header-refresh"
              disabled={isRefreshing}
              onClick={() => void handleRefresh()}
              type="button"
            >
              {isRefreshing ? "..." : "↻"}
            </button>
          )}
          showBackButton
          title="Profile"
        />

        <section className="profile-screen-content">
          <div className="profile-header-section">
            <div className="profile-avatar-shell">
              <button
                className={`profile-avatar-button ${!currentDisplayImage ? "profile-avatar-placeholder" : ""}`}
                disabled={!currentDisplayImage}
                onClick={() => currentDisplayImage && setIsViewingAvatar(true)}
                type="button"
              >
                {currentDisplayImage ? (
                  <img
                    alt={session.user.fullname || "Promoter avatar"}
                    className="profile-avatar-image"
                    src={currentDisplayImage}
                  />
                ) : (
                  <span className="profile-avatar-fallback">
                    {session.user.fullname?.charAt(0).toUpperCase() || "P"}
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

                {currentDisplayImage ? (
                  <button
                    aria-label="Delete profile picture"
                    className="profile-delete-badge"
                    disabled={isDeletingImage}
                    onClick={() => void handleDeletePicture()}
                    type="button"
                  >
                    {isDeletingImage ? (
                      <span className="profile-avatar-action-spinner">...</span>
                    ) : (
                      <TrashIcon />
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            <h2 className="profile-name-heading">
              {session.user.fullname || "Promoter"}
            </h2>

            {hasChanges ? (
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
                <span className="profile-detail-label">Promoter ID</span>
                <span className="profile-lock-tag">Locked</span>
              </div>
              <strong>{session.user.promoter_id}</strong>
            </div>

            <label className="mobile-field">
              <span>Full Name</span>
              <input
                className="mobile-input"
                onChange={(event) => setFullname(event.target.value)}
                placeholder="Enter your full name"
                value={fullname}
              />
            </label>

            <div className="profile-readonly-card">
              <div className="profile-label-row">
                <span className="profile-detail-label">Status</span>
                <span className="profile-lock-tag">Locked</span>
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
            className="fixed-width-primary"
            disabled={isSaving}
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

      {isViewingAvatar && currentDisplayImage ? (
        <div
          aria-modal="true"
          className="modal-backdrop"
          onClick={() => setIsViewingAvatar(false)}
          role="dialog"
        >
          <div
            className="profile-image-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-header">
              <div />
              <button
                className="ghost-button"
                onClick={() => setIsViewingAvatar(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <img
              alt={session.user.fullname || "Promoter avatar"}
              className="profile-image-modal-image"
              src={currentDisplayImage}
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
    </main>
  );
}
