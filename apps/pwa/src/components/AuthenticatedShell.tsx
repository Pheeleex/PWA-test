import { useEffect, useState, type ReactNode } from "react";
import appLogo from "../../../../assets/images/Logo.png";
import AlertDialog from "./AlertDialog";

type AuthenticatedShellProps = {
  activeSection?: "map" | "profile" | "settings";
  children: ReactNode;
  fullBleed?: boolean;
  isLocked?: boolean;
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
        d="M12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.8 12 8.8C10.2327 8.8 8.8 10.2327 8.8 12C8.8 13.7673 10.2327 15.2 12 15.2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M19.1 13.6C19.2 13.1 19.2 12.6 19.2 12C19.2 11.4 19.2 10.9 19.1 10.4L21 9L19 5.6L16.8 6.5C16 5.9 15.2 5.4 14.2 5.1L13.9 2.8H10.1L9.8 5.1C8.8 5.4 8 5.9 7.2 6.5L5 5.6L3 9L4.9 10.4C4.8 10.9 4.8 11.4 4.8 12C4.8 12.6 4.8 13.1 4.9 13.6L3 15L5 18.4L7.2 17.5C8 18.1 8.8 18.6 9.8 18.9L10.1 21.2H13.9L14.2 18.9C15.2 18.6 16 18.1 16.8 17.5L19 18.4L21 15L19.1 13.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
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
  isLocked = false,
  onLogout,
  onOpenMap,
  onOpenProfile,
  onOpenSettings,
}: AuthenticatedShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

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

  useEffect(() => {
    if (isLocked && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [isDrawerOpen, isLocked]);

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
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    onLogout();
  };

  return (
    <div className="authenticated-shell">
      <header className="pwa-app-navbar">
        <div className="pwa-app-navbar-inner">
          <button
            className="pwa-app-brand"
            disabled={isLocked}
            onClick={handleOpenMap}
            type="button"
          >
            <img alt="Promolocation" className="pwa-app-logo" src={appLogo} />
            <span className="pwa-app-brand-text">Promolocation</span>
          </button>

          {!isLocked ? (
            <button
              aria-expanded={isDrawerOpen}
              aria-label="Open navigation menu"
              className="pwa-app-menu-trigger"
              onClick={() => setIsDrawerOpen(true)}
              type="button"
            >
              <MenuIcon />
            </button>
          ) : null}
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

            {!isLocked ? (
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
            ) : null}

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

      <AlertDialog
        cancelText="Cancel"
        confirmText="Yes"
        message="Are you sure you want to log out?"
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
        showCancel
        title="Confirm Logout"
        type="error"
        visible={isLogoutConfirmOpen}
      />
    </div>
  );
}
