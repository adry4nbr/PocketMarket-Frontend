import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Gavel, LayoutGrid } from "lucide-react";
import CardItem from "../components/shared/CardItem";
import CardDetailModal from "../components/shared/CardDetailModal";
import SearchBar from "../components/shared/SearchBar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const PAGE_SIZE = 8;

const TABS = [
  { key: "ALL", label: "Todos", icon: LayoutGrid },
  { key: "SALE", label: "À Venda", icon: Tag },
  { key: "AUCTION", label: "Leilões", icon: Gavel },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("ALL");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [condition, setCondition] = useState("All");
  const [selectedCard, setSelectedCard] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/listings", {
          params: { page: 0, size: 100 },
        });

        const active = (data.content ?? []).filter(
          (l) => l.listingStatus === "ACTIVE",
        );

        // enriquece cada listing com dados visuais da carta
        const enriched = await Promise.all(
          active.map(async (listing) => {
            try {
              const { data: userCard } = await api.get(
                `/user-cards/${listing.userCardId}`,
              );
              return {
                id: listing.id,
                userCardId: listing.userCardId,
                name: userCard.card?.name ?? "Unknown Card",
                setName: userCard.card?.setName ?? "—",
                imageUrl:
                  userCard.card?.imageLargeUrl ??
                  userCard.card?.imageSmallUrl ??
                  null,
                rarity: userCard.card?.rarity ?? "—",
                condition: userCard.condition ?? "—",
                price: listing.price ?? listing.startingBid ?? 0,
                isAuction: listing.listingType === "AUCTION",
                currentBid: listing.currentBid ?? 0,
                endsAt: listing.auctionEndsAt ?? null,
                seller: listing.sellerName ?? "—",
                sellerId: listing.sellerId,
                listingStatus: listing.listingStatus,
              };
            } catch {
              return {
                id: listing.id,
                userCardId: listing.userCardId,
                name: "Unknown Card",
                setName: "—",
                imageUrl: null,
                rarity: "—",
                condition: "—",
                price: listing.price ?? listing.startingBid ?? 0,
                isAuction: listing.listingType === "AUCTION",
                currentBid: listing.currentBid ?? 0,
                endsAt: listing.auctionEndsAt ?? null,
                seller: listing.sellerName ?? "—",
                sellerId: listing.sellerId,
                listingStatus: listing.listingStatus,
              };
            }
          }),
        );

        setListings(enriched);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o marketplace.");
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) {
        setFavorites([]);
        return;
      }
      try {
        const { data } = await api.get("/favorites");
        setFavorites(data.map((f) => f.cardId));
      } catch {
        /* silencioso */
      }
    }
    fetchFavorites();
  }, [user]);

  const filtered = listings.filter((card) => {
    const matchTab =
      activeTab === "ALL" ||
      (activeTab === "SALE" && !card.isAuction) ||
      (activeTab === "AUCTION" && card.isAuction);
    const matchName = card.name.toLowerCase().includes(search.toLowerCase());
    const matchRarity = filter === "All" || card.rarity === filter;
    const matchCondition = condition === "All" || card.condition === condition;
    return matchTab && matchName && matchRarity && matchCondition;
  });

  const visible = filtered.slice(0, visibleCount);

  async function handleBuy(card) {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await api.post(`/purchases/${card.id}/buy`);
      alert(`"${card.name}" comprada com sucesso!`);
      setListings((prev) => prev.filter((l) => l.id !== card.id));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao comprar carta.");
    }
  }

  async function handleToggleFavorite(card) {
    if (!user) {
      navigate("/login");
      return;
    }
    const isFav = favorites.includes(card.id);
    try {
      if (isFav) {
        await api.delete(`/favorites/${card.id}`);
        setFavorites((prev) => prev.filter((id) => id !== card.id));
      } else {
        await api.post(`/favorites/${card.id}`);
        setFavorites((prev) => [...prev, card.id]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao atualizar favoritos.");
    }
  }

  // verifica se o listing pertence ao usuário logado pelo email do seller
  // já que não temos id no user, comparamos pelo sellerName com o user.name
  // TODO: trocar por sellerId quando backend retornar id no login
  function isOwnerCheck(card) {
    if (!user) return false;
    return card.seller === user.name;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Hero */}
      <div className="mx-3 sm:mx-6 mt-4 sm:mt-6 bg-blue-600 rounded-2xl p-6 sm:p-10 text-white">
        <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
          Official Marketplace
        </span>
        <h1 className="text-xl sm:text-4xl font-bold mt-4 mb-2">
          Gotta collect 'em all
        </h1>
        <p className="text-blue-100 text-sm sm:text-base max-w-md">
          Discover, buy, and track the value of your favorite Pokémon TCG cards
          in real-time.
        </p>
      </div>

      <div className="mx-3 sm:mx-6 mt-4 sm:mt-6 space-y-4">
        {/* Abas */}
        <div className="flex gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setVisibleCount(PAGE_SIZE);
              }}
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

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          condition={condition}
          onConditionChange={setCondition}
        />

        {loading && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-lg font-medium">Loading marketplace...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-lg font-medium">No listings found.</p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
            {visible.map((card) => {
              const isOwner = isOwnerCheck(card);
              return (
                <CardItem
                  key={card.id}
                  card={card}
                  isFavorited={favorites.includes(card.id)}
                  onAddToCollection={handleBuy}
                  onToggleFavorite={handleToggleFavorite}
                  isOwner={isOwner}
                  onClick={(c) => setSelectedCard({ ...c, isOwner })}
                  onBid={(c) => setSelectedCard({ ...c, isOwner })}
                />
              );
            })}
          </div>
        )}

        {visibleCount < filtered.length && (
          <div className="flex justify-center py-6">
            <button
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onAddToCollection={handleBuy}
        isOwner={selectedCard?.isOwner ?? false}
      />
    </div>
  );
}
