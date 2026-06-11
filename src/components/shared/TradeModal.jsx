import { useEffect, useId, useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

export default function TradeModal({ isOpen, onClose, card }) {
  const { t } = useLanguage();
  const titleId = useId();
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: t("common.close"),
    cancelLabel: null,
    isDanger: false,
    closeTradeModal: false,
  });

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCollection() {
      try {
        setLoading(true);
        const { data } = await api.get("/user-cards/me", {
          params: { page: 0, size: 50 },
        });
        console.debug("/user-cards/me response:", data);
        setCollection(data.content ?? []);
      } catch (err) {
        setDialog({
          open: true,
          title: t("common.error"),
          message: err.response?.data?.message || t("tradeModal.loadError"),
          confirmLabel: t("common.close"),
          cancelLabel: null,
          isDanger: true,
          closeTradeModal: false,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [isOpen, t]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const availableCards = collection.filter(
    (item) => item.status === "AVAILABLE",
  );

  async function handleOffer(myCard) {
    const receiverId = card.sellerId ?? card.ownerId;
    const requestedCardId = card.userCardId ?? card.id;

    if (!receiverId || !requestedCardId) {
      setDialog({
        open: true,
        title: t("common.error"),
        message: t("tradeModal.invalidCard"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
        closeTradeModal: false,
      });
      return;
    }

    try {
      setSubmittingId(myCard.id);
      const { data } = await api.post("/trade-offers", {
        receiverId,
        offeredCardIds: [myCard.id],
        requestedCardIds: [requestedCardId],
      });

      console.debug("trade-offers POST response:", data);

      setDialog({
        open: true,
        title: t("tradeModal.sentTitle"),
        message: t("tradeModal.sentMessage", {
          id: data.id ?? "?",
          offered: myCard.card?.name ?? t("common.cardFallback"),
          requested: card.name,
        }),
        confirmLabel: t("common.ok"),
        cancelLabel: null,
        isDanger: false,
        closeTradeModal: true,
      });
    } catch (err) {
      setDialog({
        open: true,
        title: t("common.error"),
        message: err.response?.data?.message || t("tradeModal.sendError"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
        closeTradeModal: false,
      });
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="bg-white dark:bg-gray-900 p-6 rounded-xl w-125 max-w-[90vw] border border-gray-100 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <h2 id={titleId} className="text-xl font-bold mb-4">
            {t("tradeModal.title", { name: card.name })}
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t("tradeModal.choose")}
          </p>

          {loading && (
            <div className="text-center py-10 text-gray-400">
              <p role="status" className="text-sm font-medium">
                {t("tradeModal.loading")}
              </p>
            </div>
          )}

          {!loading && availableCards.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm font-medium">
                {t("tradeModal.empty")}
              </p>
            </div>
          )}

          {!loading && availableCards.length > 0 && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {availableCards.map((myCard) => (
                <div
                  key={myCard.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3"
                >
                  <img
                    src={
                      myCard.card?.imageLargeUrl ??
                      myCard.card?.imageSmallUrl ??
                      "https://placehold.co/300x400?text=No+Image"
                    }
                    alt={myCard.card?.name ?? t("common.cardFallback")}
                    className="w-16 rounded"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/300x400?text=No+Image";
                    }}
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {myCard.card?.name ?? t("common.unknownCard")}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {myCard.card?.setName ?? "—"} • {myCard.condition}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(submittingId)}
                    aria-busy={submittingId === myCard.id}
                    className="bg-yellow-400 text-gray-950 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                    onClick={() => handleOffer(myCard)}
                  >
                    {submittingId === myCard.id
                      ? t("tradeModal.submitting")
                      : t("tradeModal.offer")}
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={dialog.open}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        cancelLabel={dialog.cancelLabel}
        isDanger={dialog.isDanger}
        onConfirm={() => {
          const shouldCloseTradeModal = dialog.closeTradeModal;
          setDialog((prev) => ({ ...prev, open: false }));
          if (shouldCloseTradeModal) onClose();
        }}
        onCancel={() => setDialog((prev) => ({ ...prev, open: false }))}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
