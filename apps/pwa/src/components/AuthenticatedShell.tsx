import { useEffect, useState, type ReactNode } from "react";
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

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pwa-app-menu-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 7H20M4 12H20M4 17H20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pwa-app-menu-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pwa-app-drawer-item-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 20.5C5.8 16.9 8.6 15 12 15C15.4 15 18.2 16.9 19.5 20.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pwa-app-drawer-item-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 15.25C13.7949 15.25 15.25 13.7949 15.25 12C15.25 10.2051 13.7949 8.75 12 8.75C10.2051 8.75 8.75 10.2051 8.75 12C8.75 13.7949 10.2051 15.25 12 15.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15.1L20.4 16.8L18.8 19.4L16.9 18.9C16.2 19.5 15.4 19.9 14.5 20.2L14 22H10L9.5 20.2C8.6 19.9 7.8 19.5 7.1 18.9L5.2 19.4L3.6 16.8L4.6 15.1C4.4 14.5 4.3 13.8 4.3 13.1C4.3 12.4 4.4 11.7 4.6 11.1L3.6 9.4L5.2 6.8L7.1 7.3C7.8 6.7 8.6 6.3 9.5 6L10 4.2H14L14.5 6C15.4 6.3 16.2 6.7 16.9 7.3L18.8 6.8L20.4 9.4L19.4 11.1C19.6 11.7 19.7 12.4 19.7 13.1C19.7 13.8 19.6 14.5 19.4 15.1Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pwa-app-drawer-item-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M10 17L15 12L10 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M15 12H4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M13.5 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function AuthenticatedShell({
  activeSection,
  children,
  fullBleed = false,
  onLogout,
  onOpenMap,
  onOpenProfile,
  onOpenSettings,
}: AuthenticatedShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenMap = () => {
    closeDrawer();
    onOpenMap();
  };

  const handleOpenProfile = () => {
    closeDrawer();
    onOpenProfile();
  };

  const handleOpenSettings = () => {
    closeDrawer();
    onOpenSettings();
  };

  const handleLogout = () => {
    closeDrawer();
    onLogout();
  };

  return (
    <div className="authenticated-shell">
      <header className="pwa-app-navbar">
        <div className="pwa-app-navbar-inner">
          <button
            className="pwa-app-brand"
            onClick={handleOpenMap}
            type="button"
          >
            <img alt="Promolocation" className="pwa-app-logo" src={appLogo} />
            <span className="pwa-app-brand-text">Promolocation</span>
          </button>

          <button
            aria-expanded={isDrawerOpen}
            aria-label="Open navigation menu"
            className="pwa-app-menu-trigger"
            onClick={() => setIsDrawerOpen(true)}
            type="button"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <div
        className={`authenticated-shell-content ${fullBleed ? "authenticated-shell-content-full" : ""}`}
      >
        {children}
      </div>

      {isDrawerOpen ? (
        <div
          aria-modal="true"
          className="pwa-drawer-backdrop"
          onClick={closeDrawer}
          role="dialog"
        >
          <aside
            className="pwa-drawer-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pwa-drawer-header">
              <button
                aria-label="Close navigation menu"
                className="pwa-drawer-close"
                onClick={closeDrawer}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <nav aria-label="Drawer navigation" className="pwa-drawer-nav">
              <button
                className={`pwa-drawer-item ${activeSection === "profile" ? "pwa-drawer-item-active" : ""}`}
                onClick={handleOpenProfile}
                type="button"
              >
                <PersonIcon />
                <span>Profile</span>
              </button>

              <button
                className={`pwa-drawer-item ${activeSection === "settings" ? "pwa-drawer-item-active" : ""}`}
                onClick={handleOpenSettings}
                type="button"
              >
                <SettingsIcon />
                <span>Settings</span>
              </button>
            </nav>

            <div className="pwa-drawer-footer">
              <button
                className="pwa-drawer-logout"
                onClick={handleLogout}
                type="button"
              >
                <LogoutIcon />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
