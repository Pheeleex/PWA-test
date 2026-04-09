import type { ReactNode } from "react";
import appLogo from "../../../../assets/images/Logo.png";

type AuthenticatedShellProps = {
  activeSection?: "map" | "profile" | "settings";
  children: ReactNode;
  fullBleed?: boolean;
  onLogout: () => void;
  onOpenMap: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
};

export default function AuthenticatedShell({
  activeSection,
  children,
  fullBleed = false,
  onLogout,
  onOpenMap,
  onOpenProfile,
  onOpenSettings,
}: AuthenticatedShellProps) {
  return (
    <div className="authenticated-shell">
      <header className="pwa-app-navbar">
        <div className="pwa-app-navbar-inner">
          <button
            className="pwa-app-brand"
            onClick={onOpenMap}
            type="button"
          >
            <img alt="Promolocation" className="pwa-app-logo" src={appLogo} />
            <span className="pwa-app-brand-text">Promolocation</span>
          </button>

          <nav className="pwa-app-nav-links" aria-label="Primary">
            <button
              className={`pwa-app-nav-link ${activeSection === "map" ? "pwa-app-nav-link-active" : ""}`}
              onClick={onOpenMap}
              type="button"
            >
              Map
            </button>
            <button
              className={`pwa-app-nav-link ${activeSection === "profile" ? "pwa-app-nav-link-active" : ""}`}
              onClick={onOpenProfile}
              type="button"
            >
              Profile
            </button>
            <button
              className={`pwa-app-nav-link ${activeSection === "settings" ? "pwa-app-nav-link-active" : ""}`}
              onClick={onOpenSettings}
              type="button"
            >
              Settings
            </button>
          </nav>

          <button className="pwa-app-logout" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      <div
        className={`authenticated-shell-content ${fullBleed ? "authenticated-shell-content-full" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
