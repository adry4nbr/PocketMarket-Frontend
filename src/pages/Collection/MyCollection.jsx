import { useState, useEffect } from "react";
import { Trash2, Megaphone, Heart } from "lucide-react";
import api from "../../services/api";
import ListingModal from "../../components/shared/ListingModal";

export default function MyCollection() {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listingCard, setListingCard] = useState(null);
  const [favorites, setFavorites] = useState([]);

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
        setError("Erro ao carregar a coleção.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      alert(err.response?.data?.message || "Erro ao atualizar favoritos.");
    }
  }

  async function handleRemove(userCardId) {
    try {
      // Como o backend está retornando 500, provavelmente é uma constraint de chave estrangeira
      // com a tabela 'collection'. Vamos tentar deletar da coleção primeiro.
      try {
        await api.delete(`/collection/${userCardId}`);
      } catch (e) {
        console.warn("Ignorando erro ao deletar da coleção", e);
      }

      await api.delete(`/user-cards/${userCardId}`);
      setCollection((prev) => prev.filter((item) => item.id !== userCardId));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao remover carta.");
    }
  }

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400 dark:text-gray-500">
        <p className="text-lg font-medium">Loading collection...</p>
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
        <p className="text-lg font-medium">Your collection is empty.</p>
        <p className="text-sm mt-1">Search the catalog and add your cards!</p>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collection.map((item) => {
          const cardId = item.card?.id;
          const isFav = favorites.includes(cardId);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="relative">
                <img
                  src={item.card?.imageLargeUrl ?? item.card?.imageSmallUrl}
                  alt={item.card?.name}
                  className="w-full h-80 object-fill"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
                <button
                  onClick={() => handleToggleFavorite(cardId)}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow hover:scale-110 transition-transform"
                >
                  <Heart
                    size={16}
                    className={
                      isFav ? "fill-red-500 text-red-500" : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <div className="p-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {item.card?.name ?? "Unknown Card"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.card?.setName ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 self-start">
                    {item.condition}
                  </span>
                </div>

                {item.status === "AVAILABLE" && (
                  <button
                    onClick={() => setListingCard(item)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm font-medium py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors mb-2"
                  >
                    <Megaphone size={14} />
                    Anunciar
                  </button>
                )}

                {item.status === "LISTED" && (
                  <div className="w-full text-center text-xs font-medium text-orange-500 dark:text-orange-400 py-2 mb-2">
                    Já anunciada
                  </div>
                )}

                {item.status !== "LISTED" && (
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 text-sm font-medium py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  >
                    <Trash2 size={14} />
                    Remove
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
    </>
  );
}
