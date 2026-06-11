import { useCallback, useEffect, useId } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel,
  onConfirm,
  onCancel,
  onClose,
  isDanger = false,
}) {
  const { t } = useLanguage();
  const titleId = useId();
  const messageId = useId();

  const handleClose = useCallback(() => {
    if (onClose) return onClose();
    if (onCancel) return onCancel();
  }, [onCancel, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") handleClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl ring-1 ring-black/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={message ? messageId : undefined}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          aria-label={t("accessibility.closeDialog")}
        >
          <X size={18} />
        </button>

        <div className="space-y-4">
          {title && (
            <h2
              id={titleId}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
          )}
          <p
            id={messageId}
            className="text-sm leading-6 text-gray-600 dark:text-gray-300 whitespace-pre-line"
          >
            {message}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {cancelLabel && (
            <button
              type="button"
              onClick={onCancel || handleClose}
              className="inline-flex justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex justify-center rounded-2xl px-4 py-2 text-sm font-medium text-white transition ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
