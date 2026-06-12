import { useEffect, useId, useState } from "react";
import { X, Repeat } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import TradeModal from "./TradeModal";
import AuctionTimer from "./AuctionTimer";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

export default function CardDetailModal({
  card,
  onClose,
  onAddToCollection,
  isOwner,
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const titleId = useId();
  const bidInputId = useId();
  const bidMessageId = useId();
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [bidValue, setBidValue] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  useEffect(() => {
    if (!card) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  async function handleBid() {
    const bid = Number(bidValue);
    if (!bidValue) {
      setBidMessage(`❌ ${t("detail.bidRequired")}`);
      return;
    }
    if (bid <= (card.currentBid ?? 0)) {
      setBidMessage(`❌ ${t("detail.bidTooLow")}`);
      return;
    }
    try {
      setBidLoading(true);
      await api.post(`/auctions/${card.id}/bids`, { amount: bid });
      setBidMessage(`✅ ${t("detail.bidSuccess")}`);
      setBidValue("");
    } catch (err) {
      setBidMessage(
        `❌ ${err.response?.data?.message ?? t("detail.bidError")}`,
      );
    } finally {
      setBidLoading(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl max-w-4xl w-full p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6 relative border-t sm:border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={bidMessage ? bidMessageId : undefined}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label={t("detail.close")}
          >
            <X size={20} />
          </button>

          {/* Imagem */}
          <div className="w-full sm:w-80 shrink-0 flex justify-center">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-40 sm:w-full rounded-xl"
              onError={(e) => {
                e.target.src = "https://placehold.co/300x400?text=No+Image";
              }}
            />
          </div>

          {/* Detalhes */}
          <div className="flex-1">
            <div className="flex gap-2 mb-3 flex-wrap">
              {card.rarity && (
                <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {card.rarity}
                </span>
              )}
              {card.condition && (
                <span className="border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1 rounded-full">
                  {card.condition}
                </span>
              )}
              {card.isAuction && (
                <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {t("card.auctionActive")}
                </span>
              )}
              {isOwner && (
                <span className="bg-gray-700 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {t("card.ownListing")}
                </span>
              )}
            </div>

            <h2
              id={titleId}
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
            >
              {card.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {card.setName}
              {card.seller || card.ownerName ? (
                <span>
                  {' '}
                  • {t("common.seller")}:{' '}
                  {card.seller ?? card.ownerName}
                </span>
              ) : null}
            </p>

            {/* Leilão */}
            {card.isAuction && (
              <div className="mb-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                    {t("detail.currentBid")}
                  </p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {card.currentBid ?? 0} {t("common.credits")}
                  </p>
                </div>
                {card.endsAt && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                      {t("detail.auctionEnds")}
                    </p>
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      <AuctionTimer endsAt={card.endsAt} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Campo de lance — só se for leilão e não for o dono */}
            {card.isAuction && user && !isOwner && (
              <div className="mb-4">
                <label
                  htmlFor={bidInputId}
                  className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 block"
                >
                  {t("detail.placeBid")}
                </label>
                <div className="flex gap-2">
                  <input
                    id={bidInputId}
                    type="number"
                    min="0"
                    value={bidValue}
                    onChange={(e) => setBidValue(e.target.value)}
                    placeholder={t("detail.bidPlaceholder")}
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleBid}
                    disabled={bidLoading}
                    aria-busy={bidLoading}
                    className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {bidLoading ? "..." : t("detail.placeBid")}
                  </button>
                </div>
                {bidMessage && (
                  <p
                    id={bidMessageId}
                    role="status"
                    className="text-sm mt-2 text-gray-600 dark:text-gray-400"
                  >
                    {bidMessage}
                  </p>
                )}
              </div>
            )}

            <hr className="my-4 border-gray-200 dark:border-gray-700" />

            {/* Footer */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {card.isAuction
                  ? `${t("detail.startingBid")}: ${card.price ?? 0} ${t("common.credits")}`
                  : `${card.price ?? 0} ${t("common.credits")}`}
              </p>

              {!isOwner && user && !card.isAuction && card.listingStatus === "ACTIVE" && (
                <button
                  type="button"
                  onClick={() => {
                    onAddToCollection(card);
                    onClose();
                  }}
                  className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  + {t("card.buy")}
                </button>
              )}

              {!isOwner && user && (
                <button
                  type="button"
                  onClick={() => setTradeModalOpen(true)}
                  className="bg-yellow-400 text-gray-950 text-sm font-medium px-5 py-2 rounded-xl hover:bg-yellow-500 transition-colors flex items-center gap-2"
                >
                  <Repeat size={16} />
                  {t("detail.tradeOffer")}
                </button>
              )}

              {!user && (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium px-5 py-2 rounded-xl cursor-not-allowed"
                >
                  {t("detail.loginToInteract")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        card={card}
      />
    </>
  );
}
