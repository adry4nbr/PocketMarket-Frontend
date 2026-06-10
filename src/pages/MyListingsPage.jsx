import { useState, useEffect } from "react";
import { Megaphone, Trash2 } from "lucide-react";
import api from "../services/api";

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        // busca todas as listings e filtra as do usuário logado pelo sellerId
        // como não há endpoint "my-listings", usamos my-sales como referência
        const { data } = await api.get("/listings", {
          params: { page: 0, size: 100 },
        });

        const myActive = (data.content ?? []).filter((l) => {
          const cache = JSON.parse(
            localStorage.getItem("listingCache") || "{}",
          );
          return l.listingStatus === "ACTIVE" && cache[l.id] !== undefined;
        });

        // enriquece com cache visual
        const cache = JSON.parse(localStorage.getItem("listingCache") || "{}");
        const enriched = myActive.map((l) => ({
          ...l,
          ...(cache[l.id] ?? {}),
        }));

        setListings(enriched);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar seus anúncios.");
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  async function handleCancel(listingId) {
    if (!confirm("Tem certeza que deseja cancelar este anúncio?")) return;
    try {
      await api.patch(`/listings/${listingId}/cancel`);
      // remove da lista local
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      // remove do cache também
      const cache = JSON.parse(localStorage.getItem("listingCache") || "{}");
      delete cache[listingId];
      localStorage.setItem("listingCache", JSON.stringify(cache));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao cancelar anúncio.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-3 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Megaphone size={24} className="text-blue-600" />
            My Listings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your active listings on the marketplace.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase">
            Active
          </p>
          <p className="text-sm sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {listings.length}
          </p>
        </div>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-700" />

      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Loading listings...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">No active listings.</p>
          <p className="text-sm mt-1">
            Go to My Collection and announce a card!
          </p>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <img
                src={listing.imageUrl ?? ""}
                alt={listing.name ?? "Unknown Card"}
                className="w-full h-80 object-fill"
                onError={(e) => {
                  e.target.src = "https://placehold.co/300x200?text=No+Image";
                }}
              />

              <div className="p-4">
                <div className="flex justify-between mb-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                    {listing.name ?? "Unknown Card"}
                  </p>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg self-start shrink-0 ml-2
                    ${
                      listing.listingType === "AUCTION"
                        ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {listing.listingType === "AUCTION" ? "Leilão" : "Venda"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {listing.setName ?? "—"} • {listing.condition ?? "—"}
                </p>

                {/* Preço */}
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {listing.listingType === "AUCTION"
                    ? `Lance atual: ${listing.currentBid ?? listing.startingBid ?? 0} cr`
                    : `${listing.price ?? 0} cr`}
                </p>

                <button
                  onClick={() => handleCancel(listing.id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 text-sm font-medium py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                >
                  <Trash2 size={14} />
                  Cancelar Anúncio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
