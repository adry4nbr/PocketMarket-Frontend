import { useState, useEffect } from "react";
import { Megaphone, Trash2, LayoutGrid, Tag, Gavel } from "lucide-react";
import api from "../services/api";
import AuctionTimer from "../components/shared/AuctionTimer";
import ConfirmationModal from "../components/shared/ConfirmationModal";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const TABS = [
  { key: "ALL", labelKey: "listings.tabs.all", icon: LayoutGrid },
  { key: "SALE", labelKey: "listings.tabs.sale", icon: Tag },
  { key: "AUCTION", labelKey: "listings.tabs.auction", icon: Gavel },
];

export default function MyListingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [cancelConfirm, setCancelConfirm] = useState({ open: false, listingId: null });
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
                name: userCard.card?.name ?? t("common.unknownCard"),
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
                name: t("common.unknownCard"),
                imageUrl: null,
                condition: "—",
              };
            }
          }),
        );

        setListings(enriched);
      } catch (err) {
        console.error(err);
        setError(t("listings.loadError"));
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [user, t]);

  async function handleCancel(listingId) {
    try {
      await api.patch(`/listings/${listingId}/cancel`);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setDialog({
        open: true,
        title: t("listings.canceledTitle"),
        message: t("listings.canceledMessage"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: false,
      });
    } catch (err) {
      setDialog({
        open: true,
        title: t("common.error"),
        message: err.response?.data?.message || t("listings.cancelError"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
      });
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
            {t("listings.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("listings.subtitle")}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase">
            {t("listings.active")}
          </p>
          <p className="text-sm sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {filtered.length}
          </p>
        </div>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-700" />

      {/* Abas */}
      <div className="flex gap-2 mb-6" role="tablist" aria-label={t("listings.tabLabel")}>
        {TABS.map(({ key, labelKey, icon: Icon }) => (
          <button
            type="button"
            key={key}
            onClick={() => setActiveTab(key)}
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

      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("listings.loading")}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("listings.empty")}</p>
          <p className="text-sm mt-1">{t("listings.emptyHint")}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,260px))] justify-center gap-6 sm:gap-7 lg:gap-8">
          {filtered.map((listing) => (
            <div
              key={listing.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15 transition-shadow hover:shadow-2xl hover:shadow-gray-900/20 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40 dark:hover:shadow-black/50"
            >
              <div className="flex h-64 items-center justify-center bg-gray-100 p-3 dark:bg-gray-800 sm:h-56">
                <img
                  src={listing.imageUrl ?? ""}
                  alt={listing.name ?? t("common.unknownCard")}
                  className="h-full w-auto max-w-full rounded-lg object-contain shadow-sm"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
              </div>

              <div className="p-3.5">
                <div className="mb-1 flex justify-between gap-2">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                    {listing.name ?? t("common.unknownCard")}
                  </p>
                  <span
                    className={`self-start shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold
                    ${
                      listing.listingType === "AUCTION"
                        ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {listing.listingType === "AUCTION"
                      ? t("common.auction")
                      : t("common.sale")}
                  </span>
                </div>

                <p className="mb-2 truncate text-xs text-gray-500 dark:text-gray-400">
                  {listing.setName ?? "—"} • {listing.condition ?? "—"}
                </p>

                {/* Preço / Lance */}
                {listing.listingType === "AUCTION" ? (
                  <div className="mb-2">
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {t("listings.currentBid")}{" "}
                      {listing.currentBid ?? listing.startingBid ?? 0}
                    </p>
                    {listing.auctionEndsAt && (
                      <div className="mt-2 text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 inline-block">
                        <AuctionTimer endsAt={listing.auctionEndsAt} />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {listing.price ?? 0}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setCancelConfirm({ open: true, listingId: listing.id })}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                >
                  <Trash2 size={14} />
                  {t("listings.cancel")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={cancelConfirm.open}
        title={t("listings.cancelTitle")}
        message={t("listings.cancelMessage")}
        confirmLabel={t("common.yesCancel")}
        cancelLabel={t("common.no")}
        isDanger={true}
        onConfirm={() => {
          handleCancel(cancelConfirm.listingId);
          setCancelConfirm({ open: false, listingId: null });
        }}
        onCancel={() => setCancelConfirm({ open: false, listingId: null })}
        onClose={() => setCancelConfirm({ open: false, listingId: null })}
      />

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
    </div>
  );
}
