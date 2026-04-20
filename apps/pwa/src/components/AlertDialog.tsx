type AlertDialogProps = {
  cancelText?: string;
  confirmText?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showCancel?: boolean;
  title: string;
  type: "error" | "info" | "success" | "warning";
  visible: boolean;
};

function AlertIcon({ type }: { type: AlertDialogProps["type"] }) {
  if (type === "success") {
    return (
      <svg aria-hidden="true" className="alert-modal-svg" viewBox="0 0 24 24">
        <path d="M7 12.5L10.3 15.8L17.2 8.7" />
      </svg>
    );
  }

  if (type === "error") {
    return (
      <svg aria-hidden="true" className="alert-modal-svg" viewBox="0 0 24 24">
        <path d="M8.5 8.5L15.5 15.5" />
        <path d="M15.5 8.5L8.5 15.5" />
      </svg>
    );
  }

  if (type === "warning") {
    return (
      <svg aria-hidden="true" className="alert-modal-svg" viewBox="0 0 24 24">
        <path d="M12 7.5V13" />
        <path d="M12 16.4H12.01" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="alert-modal-svg" viewBox="0 0 24 24">
      <path d="M12 11V16" />
      <path d="M12 7.6H12.01" />
    </svg>
  );
}


export default function AlertDialog({
  cancelText = "Cancel",
  confirmText,
  message,
  onClose,
  onConfirm,
  showCancel = false,
  title,
  type,
  visible,
}: AlertDialogProps) {
  if (!visible) {
    return null;
  }

  const primaryText = confirmText ?? (showCancel ? "Yes" : "OK");
  const primaryClassName =
    type === "error"
      ? "alert-action-button alert-action-error"
      : `alert-action-button alert-action-${type}`;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
      return;
    }

    onClose();
  };

  return (
    <div
      aria-modal="true"
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="alert-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="alert-modal-icon-wrap">
          <span className={`alert-modal-icon alert-modal-icon-${type}`}>
            <AlertIcon type={type} />
          </span>
        </div>
        <h2>{title}</h2>
        <p className="alert-modal-message">{message}</p>

        {showCancel ? (
          <div className="alert-modal-actions">
            <button
              className="alert-action-button alert-action-cancel"
              onClick={onClose}
              type="button"
            >
              {cancelText}
            </button>
            <button className={primaryClassName} onClick={handleConfirm} type="button">
              {primaryText}
            </button>
          </div>
        ) : (
          <button className={primaryClassName} onClick={handleConfirm} type="button">
            {primaryText}
          </button>
        )}
      </div>
    </div>
  );
}
