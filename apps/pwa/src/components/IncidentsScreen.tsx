import { useEffect, useMemo, useState } from "react";
import {
  fetchPromoterIncidents,
  type AuthenticatedUser,
  type Incident,
} from "@promolocation/shared";
import PwaScreenHeader from "./PwaScreenHeader";

type IncidentsScreenProps = {
  onBack: () => void;
  session: {
    apiKey: string;
    user: AuthenticatedUser;
  };
};

function formatDate(dateString?: string) {
  if (!dateString) return "No date";

  try {
    const date = new Date(dateString.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

function getStatusTone(status: string) {
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

export default function IncidentsScreen({
  onBack,
  session,
}: IncidentsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const loadIncidents = async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const nextIncidents = await fetchPromoterIncidents(
        session.user.user_id,
        session.apiKey,
      );
      setIncidents(nextIncidents);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to fetch incidents.";
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const title = incident.incident_name || incident.title || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [incidents, searchQuery]);

  return (
    <main className="screen-shell">
      <div className="mobile-page-card">
        <PwaScreenHeader onBack={onBack} showBackButton title="Incident History" />

        <section className="list-screen-content">
          <div className="search-bar-shell">
            <span className="search-icon">Search</span>
            <input
              className="search-input-web"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search incidents..."
              value={searchQuery}
            />
          </div>

          <div className="list-actions-row">
            <button className="ghost-outline" onClick={() => void loadIncidents(true)} type="button">
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          {isLoading ? (
            <p className="muted list-empty-state">Loading incidents...</p>
          ) : filteredIncidents.length === 0 ? (
            <p className="muted list-empty-state">No incidents found.</p>
          ) : (
            <div className="incident-card-list">
              {filteredIncidents.map((incident, index) => {
                const title = incident.incident_name || incident.title || "Untitled";
                const status = incident.status || "Pending";
                const tone = getStatusTone(status);

                return (
                  <button
                    className={`incident-card tone-${tone}`}
                    key={String(incident.incident_id || incident.id || index)}
                    onClick={() => setSelectedIncident(incident)}
                    type="button"
                  >
                    <div className="incident-card-header">
                      <span className="incident-card-title">{title}</span>
                      <span className={`incident-status-text status-${tone}`}>{status}</span>
                    </div>
                    <span className="incident-card-date">
                      {formatDate(incident.created_at || incident.date)}
                    </span>
                  </button>
                );
              })}
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
              <button className="ghost-button" onClick={() => setSelectedIncident(null)} type="button">
                Close
              </button>
            </div>

            <div className="incident-detail-content">
              <h2>{selectedIncident.incident_name || selectedIncident.title || "Untitled"}</h2>
              <div className="incident-detail-meta">
                <span className={`status-pill pill-${getStatusTone(selectedIncident.status || "Pending")}`}>
                  {selectedIncident.status || "Pending"}
                </span>
                <span className="muted">
                  {formatDate(selectedIncident.created_at || selectedIncident.date)}
                </span>
              </div>

              <p className="incident-detail-description">
                {selectedIncident.description}
              </p>

              {selectedIncident.photo || selectedIncident.image ? (
                <img
                  alt="Incident evidence"
                  className="incident-detail-image"
                  src={selectedIncident.photo || selectedIncident.image}
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
