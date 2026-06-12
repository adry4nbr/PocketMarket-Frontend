import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import ConfirmationModal from "../components/shared/ConfirmationModal";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";

export default function FavoritesPage() {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: t("common.close"),
    cancelLabel: null,
    isDanger: false,
  });

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/favorites");
        setFavorites(data);
      } catch (err) {
        console.error(err);
        setError(t("favorites.loadError"));
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [t]);

  async function handleUnfavorite(cardId) {
    try {
      await api.delete(`/favorites/${cardId}`);
      setFavorites((prev) => prev.filter((f) => f.cardId !== cardId));
    } catch (err) {
      const msg = err.response?.data?.message;
      setDialog({
        open: true,
        title: t("common.error"),
        message: msg || t("favorites.removeError"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-3 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Heart size={24} className="fill-red-500 text-red-500" />
          {t("favorites.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {t("favorites.subtitle")}
        </p>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-700" />

      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("favorites.loading")}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && favorites.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("favorites.empty")}</p>
          <p className="text-sm mt-1">{t("favorites.emptyHint")}</p>
        </div>
      )}

      {!loading && !error && favorites.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,260px))] justify-center gap-6 sm:gap-7 lg:gap-8">
          {favorites.map((item) => (
            <div
              key={item.favoriteId}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15 transition-shadow hover:shadow-2xl hover:shadow-gray-900/20 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40 dark:hover:shadow-black/50"
            >
              <div className="relative flex h-64 items-center justify-center bg-gray-100 p-3 dark:bg-gray-800 sm:h-56">
                <img
                  src={item.imageUrl}
                  alt={item.cardName}
                  className="h-full w-auto max-w-full rounded-lg object-contain shadow-sm"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleUnfavorite(item.cardId)}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow hover:scale-110 transition-transform"
                  aria-label={t("favorites.remove", { name: item.cardName })}
                  title={t("favorites.removeTitle")}
                >
                  <Heart size={16} className="fill-red-500 text-red-500" />
                </button>
              </div>

              <div className="p-3.5">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                      {item.cardName}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.setName}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-gray-900 dark:text-gray-100">
                    ${Number(item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
