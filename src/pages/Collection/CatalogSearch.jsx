import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { searchCatalog, listCatalog } from "../../services/catalogService";
import AddCardModal from "../../components/shared/AddCardModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useLanguage } from "../../context/LanguageContext";

export default function CatalogSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    let cancelled = false;

    async function fetchResults() {
      setLoading(true);
      try {
        const req = debouncedQuery.trim()
          ? searchCatalog(debouncedQuery)
          : listCatalog();
        const r = await req;
        if (!cancelled) setResults(r.data.content ?? r.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          aria-label={t("catalog.searchLabel")}
          placeholder={t("catalog.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("catalog.searching")}</p>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("catalog.empty")}</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,260px))] justify-center gap-6 sm:gap-7 lg:gap-8">
          {results.map((card) => (
            <div
              key={card.externalCardId}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15 transition-shadow hover:shadow-2xl hover:shadow-gray-900/20 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40 dark:hover:shadow-black/50"
            >
              <div className="flex h-64 items-center justify-center bg-gray-100 p-3 dark:bg-gray-800 sm:h-56">
                <img
                  src={card.imageLargeUrl ?? card.imageSmallUrl}
                  alt={card.name}
                  className="h-full w-auto max-w-full rounded-lg object-contain shadow-sm"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
              </div>
              <div className="p-3.5">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                  {card.name}
                </p>
                <p className="mb-2 truncate text-xs text-gray-500 dark:text-gray-400">
                  {card.setName} • {card.rarity}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCard(card)}
                  className="w-full rounded-lg bg-blue-600 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  aria-label={t("catalog.addCard", { name: card.name })}
                >
                  + {t("catalog.add")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCard && (
        <AddCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onSuccess={() => {
            setSelectedCard(null);
            if (onSuccess) onSuccess();
          }}
        />
      )}
    </div>
  );
}
