type AlertDialogProps = {
  message: string;
  onClose: () => void;
  title: string;
  type: "error" | "success";
  visible: boolean;
};

export default function AlertDialog({
  message,
  onClose,
  title,
  type,
  visible,
}: AlertDialogProps) {
  if (!visible) {
    return null;
  }

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
        <div className="alert-modal-header">
          <span className={`alert-modal-badge alert-modal-${type}`}>
            {type === "success" ? "Success" : "Error"}
          </span>
          <h2>{title}</h2>
        </div>
        <p className="alert-modal-message">{message}</p>
        <button className="primary-button alert-close-button" onClick={onClose} type="button">
          OK
        </button>
      </div>
    </div>
  );
}
