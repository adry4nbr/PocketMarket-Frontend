import AuctionTimer from "./AuctionTimer";
import { useLanguage } from "../../context/LanguageContext";

export default function CardItem({
  card,
  onAddToCollection,
  onClick,
  onBid,
  isOwner,
}) {
  const { t } = useLanguage();

  function openDetails() {
    onClick(card);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetails();
    }
  }

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15 transition-shadow hover:shadow-2xl hover:shadow-gray-900/20 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40 dark:hover:shadow-black/50"
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={t("card.viewDetails", { name: card.name })}
    >
      {/* Imagem */}
      <div className="relative flex h-64 items-center justify-center bg-gray-100 p-3 dark:bg-gray-800 sm:h-56">
        <img
          src={card.imageUrl}
          alt={card.name}
          className="h-full w-auto max-w-full rounded-lg object-contain shadow-sm"
          onError={(e) => {
            e.target.src = "https://placehold.co/300x200?text=No+Image";
          }}
        />
        {card.isAuction && (
          <div className="absolute top-2 left-2">
            <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow">
              {t("card.auctionActive")}
            </span>
          </div>
        )}
        {isOwner && (
          <div className="absolute top-2 right-2">
            <span className="bg-gray-800/70 text-white text-xs font-medium px-2 py-1 rounded-full">
              {t("card.ownListing")}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
              {card.name}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {card.setName}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {card.price} cr
            </p>
            {card.isAuction && (
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                {t("card.currentBid")}: {card.currentBid ?? 0} {t("common.credits")}
              </p>
            )}
          </div>
        </div>

        {card.isAuction && (
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              {t("card.auctionEnds")}
            </span>
            {card.endsAt && <AuctionTimer endsAt={card.endsAt} />}
          </div>
        )}

        {/* esconde botões se for anúncio próprio */}
        {!isOwner && (
          <>
            {card.isAuction ? (
              <button
                type="button"
                aria-label={t("card.bidCard", { name: card.name })}
                onClick={(e) => {
                  e.stopPropagation();
                  onBid?.(card);
                }}
                className="w-full rounded-lg bg-orange-500 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                {t("card.bid")}
              </button>
            ) : (
              <button
                type="button"
                aria-label={t("card.buyCard", { name: card.name })}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCollection(card);
                }}
                className="w-full rounded-lg bg-blue-600 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                + {t("card.buy")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
