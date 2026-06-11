import { useState, useEffect } from "react";
import { Trash2, Megaphone, Heart } from "lucide-react";
import api from "../../services/api";
import ConfirmationModal from "../../components/shared/ConfirmationModal";
import ListingModal from "../../components/shared/ListingModal";
import { useLanguage } from "../../context/LanguageContext";

export default function MyCollection() {
  const { t } = useLanguage();
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listingCard, setListingCard] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: t("common.close"),
    cancelLabel: null,
    isDanger: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cardsRes, favsRes] = await Promise.all([
          api.get("/user-cards/me", { params: { page: 0, size: 50 } }),
          api.get("/favorites"),
        ]);
        setCollection(cardsRes.data.content ?? []);
        setFavorites(favsRes.data.map((f) => f.cardId));
      } catch {
        setError(t("collection.loadError"));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [t]);

  async function handleToggleFavorite(cardId) {
    const isFav = favorites.includes(cardId);
    try {
      if (isFav) {
        await api.delete(`/favorites/${cardId}`);
        setFavorites((prev) => prev.filter((id) => id !== cardId));
      } else {
        await api.post(`/favorites/${cardId}`);
        setFavorites((prev) => [...prev, cardId]);
      }
    } catch (err) {
      setDialog({
        open: true,
        title: t("common.error"),
        message: err.response?.data?.message || t("collection.favoriteError"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
      });
    }
  }

  async function handleRemove(userCardId) {
    try {
      // Verifica se a carta está nos favoritos antes de remover
      const item = collection.find((c) => c.id === userCardId);
      const cardId = item?.card?.id;

      if (cardId && favorites.includes(cardId)) {
        try {
          await api.delete(`/favorites/${cardId}`);
          setFavorites((prev) => prev.filter((id) => id !== cardId));
        } catch (e) {
          console.warn("Não foi possível remover dos favoritos:", e);
        }
      }

      // Remove da coleção (tenta /collection primeiro por FK constraint)
      try {
        await api.delete(`/collection/${userCardId}`);
      } catch (e) {
        console.warn("Ignorando erro ao deletar da coleção", e);
      }

      await api.delete(`/user-cards/${userCardId}`);
      setCollection((prev) => prev.filter((item) => item.id !== userCardId));
    } catch (err) {
      setDialog({
        open: true,
        title: t("common.error"),
        message: err.response?.data?.message || t("collection.removeError"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
      });
    }
  }

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400 dark:text-gray-500">
        <p className="text-lg font-medium">{t("collection.loading")}</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20 text-red-400">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );

  if (collection.length === 0)
    return (
      <div className="text-center py-20 text-gray-400 dark:text-gray-500">
        <p className="text-lg font-medium">{t("collection.empty")}</p>
        <p className="text-sm mt-1">{t("collection.emptyHint")}</p>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,260px))] justify-center gap-6 sm:gap-7 lg:gap-8">
        {collection.map((item) => {
          const cardId = item.card?.id;
          const isFav = favorites.includes(cardId);

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15 transition-shadow hover:shadow-2xl hover:shadow-gray-900/20 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40 dark:hover:shadow-black/50"
            >
              <div className="relative flex h-64 items-center justify-center bg-gray-100 p-3 dark:bg-gray-800 sm:h-56">
                <img
                  src={item.card?.imageLargeUrl ?? item.card?.imageSmallUrl}
                  alt={item.card?.name}
                  className="h-full w-auto max-w-full rounded-lg object-contain shadow-sm"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(cardId)}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow hover:scale-110 transition-transform"
                  aria-label={
                    isFav
                      ? t("collection.favoriteRemove", {
                          name: item.card?.name ?? t("common.cardFallback"),
                        })
                      : t("collection.favoriteAdd", {
                          name: item.card?.name ?? t("common.cardFallback"),
                        })
                  }
                  title={
                    isFav
                      ? t("collection.favoriteRemoveTitle")
                      : t("collection.favoriteAddTitle")
                  }
                >
                  <Heart
                    size={16}
                    className={
                      isFav ? "fill-red-500 text-red-500" : "text-gray-400"
                    }
                  />
                </button>
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

                {item.status === "AVAILABLE" && (
                  <button
                    type="button"
                    onClick={() => setListingCard(item)}
                    className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
                    aria-label={t("collection.announceCard", {
                      name: item.card?.name ?? t("common.cardFallback"),
                    })}
                  >
                    <Megaphone size={14} />
                    {t("collection.announce")}
                  </button>
                )}

                {item.status === "LISTED" && (
                  <div className="mb-2 w-full py-1.5 text-center text-xs font-medium text-orange-500 dark:text-orange-400">
                    {t("collection.listed")}
                  </div>
                )}

                {item.status !== "LISTED" && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                    aria-label={t("collection.removeCard", {
                      name: item.card?.name ?? t("common.cardFallback"),
                    })}
                  >
                    <Trash2 size={14} />
                    {t("collection.remove")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {listingCard && (
        <ListingModal
          userCard={listingCard}
          onClose={() => setListingCard(null)}
          onSuccess={() => {
            setCollection((prev) =>
              prev.map((item) =>
                item.id === listingCard.id
                  ? { ...item, status: "LISTED" }
                  : item,
              ),
            );
          }}
        />
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
    </>
  );
}
