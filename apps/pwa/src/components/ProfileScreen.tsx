import { useEffect, useMemo, useState } from "react";
import {
  updatePromoterProfile,
  type AuthenticatedUser,
} from "@promolocation/shared";
import AlertDialog from "./AlertDialog";
import PwaScreenHeader from "./PwaScreenHeader";

type ProfileScreenProps = {
  onBack: () => void;
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

export default function ProfileScreen({
  onBack,
  onSessionPatch,
  session,
}: ProfileScreenProps) {
  const [fullname, setFullname] = useState(session.user.fullname || "");
  const [phone, setPhone] = useState(session.user.phone || "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(
    null,
  );
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
    setPhone(session.user.phone || "");
  }, [session.user.fullname, session.user.phone]);

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

  const handleSave = async () => {
    if (!fullname.trim() || !phone.trim()) {
      showAlert(
        "Missing Details",
        "Full Name and Phone Number are required.",
        "error",
      );
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await updatePromoterProfile(
        {
          accessToken: session.accessToken,
          apiKey: session.apiKey,
          userId: session.user.user_id,
        },
        {
          fullname: fullname.trim(),
          phone: phone.trim(),
        },
        pendingAvatarFile,
      );

      onSessionPatch({
        user: {
          ...session.user,
          ...updatedUser,
          fullname: String(updatedUser.fullname ?? fullname.trim()),
          phone: String(updatedUser.phone ?? phone.trim()),
        },
      });

      setPendingAvatarFile(null);
      showAlert("Success", "Profile updated successfully.", "success");
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
        <PwaScreenHeader onBack={onBack} showBackButton title="Profile" />

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

              <label className="profile-camera-badge">
                <span>Camera</span>
                <input
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  type="file"
                />
              </label>
            </div>

            <h2 className="profile-name-heading">
              {session.user.fullname || "Promoter"}
            </h2>

            {pendingAvatarFile ? (
              <span className="profile-pending-badge">Unsaved Changes</span>
            ) : null}
          </div>

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

            <label className="mobile-field">
              <span>Phone Number</span>
              <input
                className="mobile-input"
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                type="tel"
                value={phone}
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
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "Updating..." : "Update Profile"}
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
          <div className="profile-image-modal" onClick={(event) => event.stopPropagation()}>
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
