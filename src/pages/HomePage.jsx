import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Gavel, LayoutGrid } from "lucide-react";
import CardItem from "../components/shared/CardItem";
import CardDetailModal from "../components/shared/CardDetailModal";
import ConfirmationModal from "../components/shared/ConfirmationModal";
import SearchBar from "../components/shared/SearchBar";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

const PAGE_SIZE = 8;

const TABS = [
  { key: "ALL", labelKey: "home.tabs.all", icon: LayoutGrid },
  { key: "SALE", labelKey: "home.tabs.sale", icon: Tag },
  { key: "AUCTION", labelKey: "home.tabs.auction", icon: Gavel },
];

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: t("common.close"),
    cancelLabel: null,
    isDanger: false,
  });

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
                name: userCard.card?.name ?? t("common.unknownCard"),
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
                name: t("common.unknownCard"),
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
        setError(t("home.loadError"));
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [t]);

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
      setListings((prev) => prev.filter((l) => l.id !== card.id));
      setDialog({
        open: true,
        title: t("home.buySuccessTitle"),
        message: t("home.buySuccess", { name: card.name }),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: false,
      });
    } catch (err) {
      setDialog({
        open: true,
        title: t("common.error"),
        message: err.response?.data?.message || t("home.buyError"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
      });
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
      setDialog({
        open: true,
        title: t("common.error"),
        message:
          err.response?.data?.message || t("home.favoriteError"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
      });
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
      <div className="mx-3 sm:mx-6 mt-4 sm:mt-6 bg-blue-600 rounded-2xl p-6 sm:p-10 text-white shadow-sm shadow-red-900/10 border border-red-700/20 dark:border-red-400/10">
        <span className="bg-yellow-400 text-gray-950 text-xs font-semibold px-3 py-1 rounded-full">
          {t("home.badge")}
        </span>
        <h1 className="text-xl sm:text-4xl font-bold mt-4 mb-2">
          {t("home.title")}
        </h1>
        <p className="text-red-50 text-sm sm:text-base max-w-md">
          {t("home.subtitle")}
        </p>
      </div>

      <div className="mx-3 sm:mx-6 mt-4 sm:mt-6 space-y-4">
        {/* Abas */}
        <div className="flex gap-2" role="tablist" aria-label={t("home.tabLabel")}>
          {TABS.map(({ key, labelKey, icon: Icon }) => (
            <button
              type="button"
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
              role="tab"
              aria-selected={activeTab === key}
            >
              <Icon size={15} />
              {t(labelKey)}
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
            <p className="text-lg font-medium">{t("home.loading")}</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-lg font-medium">{t("home.empty")}</p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,260px))] justify-center gap-6 sm:gap-7 lg:gap-8">
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

        <ConfirmationModal
          isOpen={dialog.open}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          isDanger={dialog.isDanger}
          onConfirm={() => setDialog((prev) => ({ ...prev, open: false }))}
          onCancel={() => setDialog((prev) => ({ ...prev, open: false }))}
          onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
        />

        {visibleCount < filtered.length && (
          <div className="flex justify-center py-6">
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t("home.loadMore")}
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
