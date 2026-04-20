import type { ReactNode } from "react";

type PwaScreenHeaderProps = {
  onBack?: () => void;
  rightSlot?: ReactNode;
  showBackButton?: boolean;
  title: string;
};

function BackChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pwa-back-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M15 5L8 12L15 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function PwaScreenHeader({
  onBack,
  rightSlot,
  showBackButton = false,
  title,
}: PwaScreenHeaderProps) {
  return (
    <header className="pwa-screen-header">
      <div className="pwa-screen-header-side">
        {showBackButton ? (
          <button
            aria-label="Go back"
            className="pwa-back-button"
            onClick={onBack}
            type="button"
          >
            <BackChevronIcon />
          </button>
        ) : (
          <div className="pwa-header-placeholder" />
        )}
      </div>

      <div className="pwa-screen-header-title">{title}</div>

      <div className="pwa-screen-header-side header-side-right">
        {rightSlot ?? <div className="pwa-header-placeholder" />}
      </div>
    </header>
  );
}
