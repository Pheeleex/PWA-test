import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchPromoterIncidents,
  type AuthenticatedUser,
  type Incident,
} from "@promolocation/shared";
import { resolvePromolocationMediaUrl } from "../utils/mediaUrl";
import PwaScreenHeader from "./PwaScreenHeader";

type IncidentHistoryScreenProps = {
  onBack: () => void;
  session: {
    apiKey: string;
    user: AuthenticatedUser;
  };
};

function formatDate(dateString?: string) {
  if (!dateString) {
    return "No date";
  }

  try {
    const date = new Date(dateString.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("en-US", {
      day: "numeric",
      hour: "numeric",
      hour12: true,
      minute: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function getStatusTone(status?: string) {
  switch (status) {
    case "Resolved":
      return "resolved";
    case "In Progress":
      return "progress";
    case "Pending":
      return "pending";
    default:
      return "neutral";
  }
}

export default function IncidentHistoryScreen({
  onBack,
  session,
}: IncidentHistoryScreenProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedImageError, setSelectedImageError] = useState(false);

  const loadIncidents = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextIncidents = await fetchPromoterIncidents(
        session.user.user_id,
        session.apiKey,
      );
      setIncidents(nextIncidents);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load incidents.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [session.apiKey, session.user.user_id]);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return incidents;
    }

    return incidents.filter((incident) => {
      const title = incident.incident_name || incident.title || "";
      return title.toLowerCase().includes(normalizedQuery);
    });
  }, [incidents, searchQuery]);

  const selectedImageUrl = useMemo(() => {
    return resolvePromolocationMediaUrl(
      selectedIncident?.photo || selectedIncident?.image || "",
    );
  }, [selectedIncident]);

  return (
    <main className="screen-shell">
      <div className="mobile-page-card">
        <PwaScreenHeader
          onBack={onBack}
          rightSlot={(
            <button
              className="ghost-button"
              onClick={() => void loadIncidents()}
              type="button"
            >
              {isLoading ? "..." : "Refresh"}
            </button>
          )}
          showBackButton
          title="Incident History"
        />

        <section className="list-screen-content">
          <label className="mobile-field">
            <span>Search</span>
            <input
              className="mobile-input"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search incidents..."
              value={searchQuery}
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          {isLoading ? (
            <p className="muted">Loading incidents...</p>
          ) : filteredIncidents.length ? (
            <div className="incident-card-list">
              {filteredIncidents.map((incident, index) => {
                const title = incident.incident_name || incident.title || "Untitled";
                const tone = getStatusTone(incident.status);
                const date = incident.created_at || incident.date;

                return (
                  <button
                    className={`incident-card tone-${tone}`}
                    key={String(incident.incident_id || incident.id || index)}
                    onClick={() => {
                      setSelectedIncident(incident);
                      setSelectedImageError(false);
                    }}
                    type="button"
                  >
                    <div className="incident-card-header">
                      <span className="incident-card-title">{title}</span>
                      <span className={`incident-status-text status-${tone}`}>
                        {incident.status || "Unknown"}
                      </span>
                    </div>
                    <div className="incident-card-date">{formatDate(date)}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="list-empty-state">
              <p className="muted">No incidents found.</p>
            </div>
          )}
        </section>
      </div>

      {selectedIncident ? (
        <div
          aria-modal="true"
          className="modal-backdrop"
          onClick={() => setSelectedIncident(null)}
          role="dialog"
        >
          <div
            className="incident-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-header">
              <div />
              <button
                className="ghost-button"
                onClick={() => setSelectedIncident(null)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="incident-detail-content">
              <h2>{selectedIncident.incident_name || selectedIncident.title || "Untitled"}</h2>
              <div className="incident-detail-meta">
                <span className={`incident-status-text status-${getStatusTone(selectedIncident.status)}`}>
                  {selectedIncident.status || "Unknown"}
                </span>
                <span className="incident-card-date">
                  {formatDate(selectedIncident.created_at || selectedIncident.date)}
                </span>
              </div>
              <p className="incident-detail-description">
                {selectedIncident.description || "No description provided."}
              </p>

              {selectedImageUrl && !selectedImageError ? (
                <img
                  alt={selectedIncident.incident_name || "Incident attachment"}
                  className="incident-detail-image"
                  onError={() => setSelectedImageError(true)}
                  src={selectedImageUrl}
                />
              ) : (
                <div className="incident-no-image">No image available</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
