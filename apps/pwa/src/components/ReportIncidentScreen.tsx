import { useEffect, useRef, useState } from "react";
import {
  createPromoterIncident,
  type AuthenticatedUser,
} from "@promolocation/shared";
import AlertDialog from "./AlertDialog";
import PwaScreenHeader from "./PwaScreenHeader";

type ReportIncidentScreenProps = {
  onBack: () => void;
  session: {
    apiKey: string;
    user: AuthenticatedUser;
  };
};

export default function ReportIncidentScreen({
  onBack,
  session,
}: ReportIncidentScreenProps) {
  const [incidentName, setIncidentName] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl("");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [photoFile]);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error",
  ) => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);

    if (alertConfig.type === "success") {
      setIncidentName("");
      setDescription("");
      setPhotoFile(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      showAlert("Error", "Please choose an image file.", "error");
      event.target.value = "";
      return;
    }

    setPhotoFile(nextFile);
    event.target.value = "";
  };

  const handleSubmit = async () => {
    if (!incidentName.trim()) {
      showAlert("Error", "Please provide an incident name/title.", "error");
      return;
    }

    if (!description.trim()) {
      showAlert(
        "Error",
        "Please provide a description of the incident.",
        "error",
      );
      return;
    }

    if (!session.user.promoter_id.trim()) {
      showAlert("Error", "Please provide your Promoter Code.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPromoterIncident(
        {
          description: description.trim(),
          incident_name: incidentName.trim(),
          photo: photoFile,
          promoter_id: session.user.promoter_id,
          user_id: session.user.user_id,
        },
        session.apiKey,
      );

      showAlert(
        "Report Submitted",
        "Your incident report has been submitted successfully.",
        "success",
      );
    } catch (error) {
      showAlert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to submit report. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="screen-shell">
      <div className="mobile-page-card">
        <PwaScreenHeader onBack={onBack} showBackButton title="Report Incident" />

        <section className="mobile-form-content">
          <label className="mobile-field">
            <span>Promoter Code</span>
            <input
              className="mobile-input mobile-input-disabled"
              disabled
              value={session.user.promoter_id}
            />
          </label>

          <label className="mobile-field">
            <span>Incident Title</span>
            <input
              className="mobile-input"
              onChange={(event) => setIncidentName(event.target.value)}
              placeholder="Enter incident title"
              value={incidentName}
            />
          </label>

          <label className="mobile-field">
            <span>Description</span>
            <textarea
              className="mobile-input mobile-textarea"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the incident in detail..."
              value={description}
            />
          </label>

          <div className="mobile-field">
            <span>Upload Photo (Optional)</span>
            <input
              accept="image/*"
              capture="environment"
              className="report-upload-input"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            <div className="report-upload-panel">
              {photoPreviewUrl ? (
                <div className="report-preview-shell">
                  <img
                    alt="Incident preview"
                    className="report-preview-image"
                    src={photoPreviewUrl}
                  />
                </div>
              ) : (
                <p className="report-secondary-text">No photo selected.</p>
              )}

              <div className="report-upload-actions">
                <button
                  className="ghost-outline"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  {photoPreviewUrl ? "Replace photo" : "Upload photo"}
                </button>
                {photoPreviewUrl ? (
                  <button
                    className="ghost-button"
                    onClick={() => setPhotoFile(null)}
                    type="button"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <button
            className="fixed-width-primary"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </section>
      </div>

      <AlertDialog
        message={alertConfig.message}
        onClose={handleCloseAlert}
        title={alertConfig.title}
        type={alertConfig.type}
        visible={alertVisible}
      />
    </main>
  );
}
