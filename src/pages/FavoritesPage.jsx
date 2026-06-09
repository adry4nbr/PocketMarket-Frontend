import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import api from "../services/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/favorites");
        setFavorites(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar favoritos.");
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  async function handleUnfavorite(cardId) {
    try {
      await api.delete(`/favorites/${cardId}`);
      setFavorites((prev) => prev.filter((f) => f.cardId !== cardId));
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(msg || "Erro ao remover favorito.");
    }
  }

  async function handleAddToCollection(cardId) {
    try {
      await api.post("/collection", { userCardId: cardId });
      alert("Card adicionado à coleção!");
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(msg || "Erro ao adicionar à coleção.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-3 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Heart size={24} className="fill-red-500 text-red-500" />
          Favorites
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Cards you are keeping an eye on.
        </p>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-700" />

      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Loading favorites...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && favorites.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">No favorites yet.</p>
          <p className="text-sm mt-1">
            Heart a card in the Marketplace to save it here!
          </p>
        </div>
      )}

      {!loading && !error && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((item) => (
            <div
              key={item.favoriteId}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.cardName}
                  className="w-full h-80 object-fill"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
                <button
                  onClick={() => handleUnfavorite(item.cardId)}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow hover:scale-110 transition-transform"
                >
                  <Heart size={16} className="fill-red-500 text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {item.cardName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.setName}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    ${Number(item.price).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => handleAddToCollection(item.cardId)}
                  className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  + Add to Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
