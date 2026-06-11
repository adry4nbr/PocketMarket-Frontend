import { useState, useEffect } from "react";
import { Megaphone, Trash2, LayoutGrid, Tag, Gavel } from "lucide-react";
import api from "../services/api";
import AuctionTimer from "../components/shared/AuctionTimer";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { key: "ALL", label: "Todos", icon: LayoutGrid },
  { key: "SALE", label: "Anúncios", icon: Tag },
  { key: "AUCTION", label: "Leilões", icon: Gavel },
];

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    async function fetchListings() {
      if (!user) return;

      try {
        setLoading(true);
        const { data } = await api.get("/listings", {
          params: { page: 0, size: 100 },
        });

        // Filtra para pegar apenas os anúncios ativos e que pertencem ao usuário logado
        // Temporariamente usando sellerName vs user.name enquanto não temos id no login
        const myActive = (data.content ?? []).filter(
          (l) => l.listingStatus === "ACTIVE" && l.sellerName === user.name,
        );

        // Enriquece cada listing com os dados visuais direto da API
        const enriched = await Promise.all(
          myActive.map(async (listing) => {
            try {
              const { data: userCard } = await api.get(
                `/user-cards/${listing.userCardId}`,
              );
              return {
                ...listing,
                name: userCard.card?.name ?? "Unknown Card",
                setName: userCard.card?.setName ?? "—",
                imageUrl:
                  userCard.card?.imageLargeUrl ??
                  userCard.card?.imageSmallUrl ??
                  null,
                condition: userCard.condition ?? "—",
              };
            } catch {
              return {
                ...listing,
                name: "Unknown Card",
                imageUrl: null,
                condition: "—",
              };
            }
          }),
        );

        setListings(enriched);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar seus anúncios.");
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [user]);

  async function handleCancel(listingId) {
    if (!confirm("Tem certeza que deseja cancelar este anúncio?")) return;
    try {
      await api.patch(`/listings/${listingId}/cancel`);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao cancelar anúncio.");
    }
  }

  const filtered = listings.filter((l) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "SALE") return l.listingType === "SALE";
    if (activeTab === "AUCTION") return l.listingType === "AUCTION";
    return true;
  });

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
            {filtered.length}
          </p>
        </div>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-700" />

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

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

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">No active listings.</p>
          <p className="text-sm mt-1">
            Go to My Collection and announce a card!
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((listing) => (
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

                {/* Preço / Lance */}
                {listing.listingType === "AUCTION" ? (
                  <div className="mb-3">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      Lance atual:{" "}
                      {listing.currentBid ?? listing.startingBid ?? 0}
                    </p>
                    {listing.auctionEndsAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <AuctionTimer endsAt={listing.auctionEndsAt} />
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {listing.price ?? 0}
                  </p>
                )}

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
