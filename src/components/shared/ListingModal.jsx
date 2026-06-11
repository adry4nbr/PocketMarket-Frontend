import { useState } from "react";
import { X, Tag, Gavel } from "lucide-react";
import api from "../../services/api";

const TABS = [
  { key: "SALE", label: "Preço Fixo", icon: Tag },
  { key: "AUCTION", label: "Leilão", icon: Gavel },
];

export default function ListingModal({ userCard, onClose, onSuccess }) {
  const [tab, setTab] = useState("SALE");
  const [price, setPrice] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [minIncrement, setMinIncrement] = useState("");
  const [auctionEndsAt, setAuctionEndsAt] = useState("");
  const [step, setStep] = useState("idle");
  const [error, setError] = useState("");

  if (!userCard) return null;

  async function handleSubmit() {
    setError("");
    setStep("loading");

    try {
      if (tab === "SALE") {
        if (!price || Number(price) <= 0) {
          setError("Informe um preço válido.");
          setStep("error");
          return;
        }
        await api.post(`/listings/sale/${userCard.id}`, {
          price: Number(price),
        });
      } else {
        if (!startingBid || !minIncrement || !auctionEndsAt) {
          setError("Preencha todos os campos do leilão.");
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
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar anúncio.");
      setStep("error");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 relative border-t sm:border border-gray-100 dark:border-gray-700 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
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
            <h2 className="font-bold text-gray-900 dark:text-gray-100">
              {userCard.card?.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userCard.card?.setName} • {userCard.condition}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
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
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {tab === "SALE" && (
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
              Preço (créditos)
            </label>
            <input
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
                Lance inicial (créditos)
              </label>
              <input
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
                Incremento mínimo (créditos)
              </label>
              <input
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
                Encerramento do leilão
              </label>
              <input
                type="datetime-local"
                value={auctionEndsAt}
                onChange={(e) => setAuctionEndsAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={step === "loading"}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {step === "loading" ? "Anunciando..." : "Confirmar Anúncio"}
        </button>
      </div>
    </div>
  );
}
