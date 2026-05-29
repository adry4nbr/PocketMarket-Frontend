import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockCards } from "../mock/cards";
import CardItem from "../components/shared/CardItem";
import CardDetailModal from "../components/shared/CardDetailModal";
import SearchBar from "../components/shared/SearchBar";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 8;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedCard, setSelectedCard] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = mockCards.filter((card) => {
    const matchName = card.name.toLowerCase().includes(search.toLowerCase());
    const matchRarity = filter === "All" || card.rarity === filter;
    return matchName && matchRarity;
  });

  const visible = filtered.slice(0, visibleCount);

  function handleAddToCollection(card) {
    if (!user) {
      navigate("/login");
      return;
    }
    alert(`"${card.name}" adicionado à coleção! (mock)`);
  }

  function handleToggleFavorite(card) {
    if (!user) {
      navigate("/login");
      return;
    }
    setFavorites((prev) =>
      prev.includes(card.id)
        ? prev.filter((id) => id !== card.id)
        : [...prev, card.id]
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="mx-6 mt-6 bg-blue-600 rounded-2xl p-10 text-white">
        <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
          Official Marketplace
        </span>
        <h1 className="text-4xl font-bold mt-4 mb-2">Gotta collect 'em all</h1>
        <p className="text-blue-100 text-base max-w-md">
          Discover, buy, and track the value of your favorite Pokémon TCG cards in real-time.
        </p>
      </div>

      {/* Search + Cards */}
      <div className="mx-6 mt-6 space-y-4">
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />

        {/* Grid */}
        <div className="grid grid-cols-4 gap-4">
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

        {/* Load More */}
        {visibleCount < filtered.length && (
          <div className="flex justify-center py-6">
            <button
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              Load More Cards
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onAddToCollection={handleAddToCollection}
      />
    </div>
  );
}
