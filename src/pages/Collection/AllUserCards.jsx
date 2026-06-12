import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import api from "../../services/api";
import CardDetailModal from "../../components/shared/CardDetailModal";
import { useLanguage } from "../../context/LanguageContext";

const PAGE_SIZE = 20;

export default function AllUserCards() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCards() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/user-cards", {
          params: { page, size: PAGE_SIZE },
        });

        if (!cancelled) {
          setCards(data.content ?? []);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(t("collection.loadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCards();
    return () => {
      cancelled = true;
    };
  }, [page, t]);

  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cards;
    return cards.filter((card) =>
      card.card?.name?.toLowerCase().includes(normalized) ||
      card.card?.setName?.toLowerCase().includes(normalized) ||
      card.ownerName?.toLowerCase().includes(normalized),
    );
  }, [cards, query]);

  const mapToCardDetail = (item) => ({
    ...item,
    id: item.id,
    userCardId: item.id,
    sellerId: item.ownerId,
    ownerId: item.ownerId,
    seller: item.ownerName,
    ownerName: item.ownerName,
    name: item.card?.name ?? item.name,
    setName: item.card?.setName ?? item.setName,
    imageUrl: item.card?.imageLargeUrl ?? item.card?.imageSmallUrl ?? item.imageUrl,
    rarity: item.card?.rarity ?? item.rarity,
    condition: item.condition ?? item.card?.condition,
    isAuction: item.isAuction ?? false,
    price: item.price ?? 0,
    currentBid: item.currentBid ?? 0,
    endsAt: item.endsAt ?? null,
    listingStatus: item.listingStatus ?? item.status,
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          aria-label={t("collection.allCardsSearchLabel")}
          placeholder={t("collection.allCardsPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("collection.loading")}</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && filteredCards.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("collection.noCards")}</p>
        </div>
      )}

      {!loading && !error && filteredCards.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,260px))] justify-center gap-6 sm:gap-7 lg:gap-8">
          {filteredCards.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedCard(mapToCardDetail(item))}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15 transition-shadow hover:shadow-2xl hover:shadow-gray-900/20 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40 dark:hover:shadow-black/50 text-left"
            >
              <div className="flex h-64 items-center justify-center bg-gray-100 p-3 dark:bg-gray-800 sm:h-56">
                <img
                  src={item.card?.imageLargeUrl ?? item.card?.imageSmallUrl}
                  alt={item.card?.name}
                  className="h-full w-auto max-w-full rounded-lg object-contain shadow-sm"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
              </div>
              <div className="p-3.5">
                <div className="mb-2 flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                      {item.card?.name ?? t("common.unknownCard")}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.card?.setName ?? "—"}
                    </p>
                  </div>
                  <span className="self-start rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {item.condition}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {t("collection.owner")}: {item.ownerName ?? t("common.unknown")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    {item.status}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {t("collection.userCardId")}: {item.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            {t("common.previous")}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("collection.pageIndicator", { page: page + 1, total: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            {t("common.next")}
          </button>
        </div>
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAddToCollection={() => {}}
          isOwner={false}
        />
      )}
    </div>
  );
}
