import { useState, useEffect } from "react";
import { BarChart2, Trash2, Heart } from "lucide-react";
import api from "../services/api";

export default function CollectionPage() {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/collection");
        const detailed = await Promise.all(
          data.map(async (item) => {
            try {
              const { data: card } = await api.get(`/cards/${item.userCardId}`);
              return { ...item, card };
            } catch {
              return { ...item, card: null };
            }
          }),
        );
        setCollection(detailed);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar a Coleção.");
      } finally {
        setLoading(false);
      }
    }
    fetchCollection();
  }, []);

  const totalValue = collection.reduce(
    (sum, item) => sum + (item.card?.price ?? 0),
    0,
  );

  async function handleRemove(collectionId) {
    try {
      await api.delete(`/collection/${collectionId}`);
      setCollection((prev) =>
        prev.filter((item) => item.collectionId !== collectionId),
      );
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(msg || "Erro ao remover card da coleção.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-3 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart2 size={24} className="text-blue-600" />
            My Collection
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your cards and track their value.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-2 py-2 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase">
            Total Value
          </p>
          <p className="text-sm sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-700" />

      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Loading collection...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && collection.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Your collection is empty.</p>
          <p className="text-sm mt-1">Add cards from the Marketplace!</p>
        </div>
      )}

      {!loading && !error && collection.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collection.map((item) => (
            <div
              key={item.collectionId}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="relative">
                <img
                  src={item.card?.imageUrl}
                  alt={item.card?.name}
                  className="w-full h-80 object-fill"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
                <button className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow">
                  <Heart size={16} className="text-gray-400" />
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
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    ${(item.card?.price ?? 0).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(item.collectionId)}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 text-sm font-medium py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
