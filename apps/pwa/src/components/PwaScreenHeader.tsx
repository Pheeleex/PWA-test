import type { ReactNode } from "react";

type PwaScreenHeaderProps = {
  onBack?: () => void;
  rightSlot?: ReactNode;
  showBackButton?: boolean;
  title: string;
};

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
          <button className="pwa-back-button" onClick={onBack} type="button">
            &lt;
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
