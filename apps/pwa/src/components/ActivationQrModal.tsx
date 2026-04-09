import QRCode from "react-qr-code";

type ActivationQrModalProps = {
  onClose: () => void;
  qrUrl: string;
  zoneName: string;
};

export default function ActivationQrModal({
  onClose,
  qrUrl,
  zoneName,
}: ActivationQrModalProps) {
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
            <p className="eyebrow">Activation QR</p>
            <h2>{zoneName}</h2>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="qr-code-frame">
          <QRCode
            bgColor="#FFFFFF"
            fgColor="#000000"
            size={260}
            value={qrUrl}
          />
        </div>

        <p className="qr-help-text">
          This QR stays available while you remain inside the activation zone
          with a reliable GPS fix.
        </p>

        <div className="qr-disclaimer">
          <strong>Important:</strong> Nur fur erwachsene Raucher/innen. Wenn Du
          junger als 25 Jahre aussiehst, ist die Vorlage eines Ausweises
          erforderlich.
        </div>
      </div>
    </div>
  );
}
