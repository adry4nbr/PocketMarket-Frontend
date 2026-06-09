import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardItem from "../components/shared/CardItem";
import CardDetailModal from "../components/shared/CardDetailModal";
import SearchBar from "../components/shared/SearchBar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const PAGE_SIZE = 8;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [condition, setCondition] = useState("All");
  const [selectedCard, setSelectedCard] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Busca cards da API
  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true);
        const { data } = await api.get("/cards");
        setCards(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar os Cards.");
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  // Busca favoritos do usuário logado
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
        // silencioso
      }
    }
    fetchFavorites();
  }, [user]);

  const filtered = cards.filter((card) => {
    const matchName = card.name.toLowerCase().includes(search.toLowerCase());
    const matchRarity = filter === "All" || card.rarity === filter;
    const matchCondition = condition === "All" || card.condition === condition;
    return matchName && matchRarity && matchCondition;
  });

  const visible = filtered.slice(0, visibleCount);

  async function handleAddToCollection(card) {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/collection", { userCardId: card.id });
      alert(`"${card.name}" adicionado à coleção!`);
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(msg || "Erro ao adicionar à coleção.");
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
      const msg = err.response?.data?.message;
      alert(msg || "Erro ao atualizar favoritos.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Hero Banner */}
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

      {/* Search + Cards */}
      <div className="mx-3 sm:mx-6 mt-4 sm:mt-6 space-y-4">
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
            <p className="text-lg font-medium">Loading cards...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-lg font-medium">No cards found.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
            {visible.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                isFavorited={favorites.includes(card.id)}
                onAddToCollection={handleAddToCollection}
                onToggleFavorite={handleToggleFavorite}
                onClick={setSelectedCard}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {visibleCount < filtered.length && (
          <div className="flex justify-center py-6">
            <button
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Load More Cards
            </button>
          </div>
        )}
      </div>

      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onAddToCollection={handleAddToCollection}
      />
    </div>
  );
}
