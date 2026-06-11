import { useEffect, useId, useState } from "react";
import { X, Tag, Gavel } from "lucide-react";
import api from "../../services/api";
import ConfirmationModal from "./ConfirmationModal";
import { useLanguage } from "../../context/LanguageContext";

const TABS = [
  { key: "SALE", labelKey: "listing.fixedPrice", icon: Tag },
  { key: "AUCTION", labelKey: "listing.auction", icon: Gavel },
];

export default function ListingModal({ userCard, onClose, onSuccess }) {
  const { t } = useLanguage();
  const titleId = useId();
  const errorId = useId();
  const [tab, setTab] = useState("SALE");
  const [price, setPrice] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [minIncrement, setMinIncrement] = useState("");
  const [auctionEndsAt, setAuctionEndsAt] = useState("");
  const [step, setStep] = useState("idle");
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: t("common.close"),
    cancelLabel: null,
    isDanger: false,
  });

  useEffect(() => {
    if (!userCard) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [userCard, onClose]);

  if (!userCard) return null;

  async function handleSubmit() {
    setError("");
    setStep("loading");

    try {
      if (tab === "SALE") {
        if (!price || Number(price) <= 0) {
          setError(t("listing.invalidPrice"));
          setStep("error");
          return;
        }
        await api.post(`/listings/sale/${userCard.id}`, {
          price: Number(price),
        });
      } else {
        if (!startingBid || !minIncrement || !auctionEndsAt) {
          setError(t("listing.auctionRequired"));
          setStep("error");
          return;
        }
        await api.post(`/listings/auction/${userCard.id}`, {
          startingBid: Number(startingBid),
          minBidIncrement: Number(minIncrement),
          auctionEndsAt: new Date(auctionEndsAt).toISOString(),
        });
      }

      setStep("idle");
      onSuccess?.();
      setDialog({
        open: true,
        title: t("listing.createdTitle"),
        message: tab === "SALE" ? t("listing.saleCreated") : t("listing.auctionCreated"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: false,
      });
      setPrice("");
      setStartingBid("");
      setMinIncrement("");
      setAuctionEndsAt("");
    } catch (err) {
      setError(err.response?.data?.message || t("listing.createError"));
      setStep("error");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 relative border-t sm:border border-gray-100 dark:border-gray-700 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label={t("listing.close")}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <img
            src={userCard.card?.imageLargeUrl ?? userCard.card?.imageSmallUrl}
            alt={userCard.card?.name}
            className="w-12 rounded-lg"
            onError={(e) => {
              e.target.src = "https://placehold.co/48x64?text=?";
            }}
          />
          <div>
            <h2 id={titleId} className="font-bold text-gray-900 dark:text-gray-100">
              {userCard.card?.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userCard.card?.setName} • {userCard.condition}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {TABS.map(({ key, labelKey, icon: Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() => {
                setTab(key);
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors
                ${
                  tab === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              aria-pressed={tab === key}
            >
              <Icon size={14} />
              {t(labelKey)}
            </button>
          ))}
        </div>

        {tab === "SALE" && (
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
              {t("listing.price")}
            </label>
            <input
              aria-label={t("listing.priceLabel")}
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 150"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
            />
          </div>
        )}

        {tab === "AUCTION" && (
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                {t("listing.startingBid")}
              </label>
              <input
                aria-label={t("listing.startingBidLabel")}
                type="number"
                min="1"
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
                placeholder="Ex: 100"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                {t("listing.minIncrement")}
              </label>
              <input
                aria-label={t("listing.minIncrementLabel")}
                type="number"
                min="1"
                value={minIncrement}
                onChange={(e) => setMinIncrement(e.target.value)}
                placeholder="Ex: 10"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                {t("listing.auctionEnds")}
              </label>
              <input
                aria-label={t("listing.auctionEndsLabel")}
                type="datetime-local"
                value={auctionEndsAt}
                onChange={(e) => setAuctionEndsAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-500 mb-4">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={step === "loading"}
          aria-busy={step === "loading"}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {step === "loading" ? t("listing.announcing") : t("listing.confirm")}
        </button>
      </div>
      <ConfirmationModal
        isOpen={dialog.open}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        cancelLabel={dialog.cancelLabel}
        isDanger={dialog.isDanger}
        onConfirm={() => {
          setDialog((prev) => ({ ...prev, open: false }));
          onClose();
        }}
        onCancel={() => setDialog((prev) => ({ ...prev, open: false }))}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
