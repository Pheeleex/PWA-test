import type { PwaInstallState } from "../hooks/usePwaInstall";

type PwaInstallCardProps = {
  install: PwaInstallState;
  persistent?: boolean;
  variant?: "default" | "onboarding";
};

export default function PwaInstallCard({
  install,
  persistent = false,
  variant = "default",
}: PwaInstallCardProps) {
  if (persistent ? !install.isAvailable : !install.isVisible) {
    return null;
  }

  const title = install.needsManualInstall
    ? "Add to your home screen"
    : "Install Promolocation";
  const description = install.needsManualInstall
    ? 'On iPhone or iPad, open the Share menu in Safari and choose "Add to Home Screen" to install the app.'
    : "Install the app for faster launch, a cleaner full-screen experience, and better offline support.";

  return (
    <section className={`pwa-install-card pwa-install-card-${variant}`}>
      <div className="pwa-install-copy">
        <p className="eyebrow">Install App</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="pwa-install-actions">
        {install.canInstall ? (
          <button
            className="primary-button pwa-install-primary"
            disabled={install.isPrompting}
            onClick={() => void install.promptInstall()}
            type="button"
          >
            {install.isPrompting ? "Opening..." : "Install"}
          </button>
        ) : null}

        {persistent ? null : (
          <button
            className={`pwa-install-dismiss ${variant === "onboarding" ? "pwa-install-dismiss-light" : ""}`}
            onClick={install.dismiss}
            type="button"
          >
            Maybe later
          </button>
        )}
      </div>
    </section>
  );
}
