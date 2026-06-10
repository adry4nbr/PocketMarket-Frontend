import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { searchCatalog, listCatalog } from "../../services/catalogService";
import AddCardModal from "../../components/shared/AddCardModal";
import { useDebounce } from "../../hooks/useDebounce";

export default function CatalogSearch() {
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
          placeholder="Buscar carta no catálogo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Buscando...</p>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Nenhuma carta encontrada.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((card) => (
            <div
              key={card.externalCardId}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <img
                src={card.imageLargeUrl ?? card.imageSmallUrl}
                alt={card.name}
                className="w-full h-80 object-fill"
                onError={(e) => {
                  e.target.src = "https://placehold.co/300x200?text=No+Image";
                }}
              />
              <div className="p-4">
                <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                  {card.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">
                  {card.setName} • {card.rarity}
                </p>
                <button
                  onClick={() => setSelectedCard(card)}
                  className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  + Adicionar à Coleção
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
          onSuccess={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
