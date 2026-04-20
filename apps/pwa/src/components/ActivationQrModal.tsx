import { useMemo, useState } from "react";
import { resolvePromolocationMediaUrl } from "../utils/mediaUrl";

type ActivationQrModalProps = {
  onClose: () => void;
  promoImageUrl: string;
  zoneName: string;
};

export default function ActivationQrModal({
  onClose,
  promoImageUrl,
  zoneName,
}: ActivationQrModalProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const resolvedPromoImageUrl = useMemo(() => {
    return resolvePromolocationMediaUrl(promoImageUrl);
  }, [promoImageUrl]);
  const hasPromoImage = resolvedPromoImageUrl.length > 0 && !hasLoadError;

  return (
    <div
      aria-modal="true"
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="qr-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-header">
          <div>
            <p className="eyebrow">{zoneName}</p>
            <h2>Scan To Activate</h2>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="qr-code-frame">
          {hasPromoImage ? (
            <img
              alt="Promotional activation"
              className="qr-promo-image"
              onError={() => setHasLoadError(true)}
              src={resolvedPromoImageUrl}
            />
          ) : (
            <div className="qr-error-state">
              <span className="qr-error-badge">!</span>
              <strong>No promotional image found</strong>
              <p>
                This account does not have a promo image yet. Please contact
                support if this should already be available.
              </p>
            </div>
          )}
        </div>

        <p className="qr-help-text">
          This activation stays available while you remain inside the activation zone
          with a reliable GPS fix.
        </p>

        <div className="qr-disclaimer">
          <strong>Important:</strong> Nur für erwachsene Raucher/innen – wenn Du
          jünger als 25 Jahre aussiehst, ist die Vorlage eines Ausweises
          erforderlich.
        </div>
      </div>
    </div>
  );
}
