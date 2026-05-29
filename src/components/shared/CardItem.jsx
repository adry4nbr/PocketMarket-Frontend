import { Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function CardItem({ card, onAddToCollection, onToggleFavorite, isFavorited, onClick }) {
  const { user } = useAuth();

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(card)}
    >
      {/* Imagem */}
      <div className="relative">
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-full h-52 object-cover"
          onError={(e) => {
            e.target.src = "https://placehold.co/300x200?text=No+Image";
          }}
        />
        {/* Botão favorito */}
        {user && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(card);
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow hover:scale-110 transition-transform"
          >
            <Heart
              size={16}
              className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-gray-900">{card.name}</p>
            <p className="text-sm text-gray-500">{card.setName}</p>
          </div>
          <p className="font-bold text-gray-900">${card.price.toFixed(2)}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCollection(card);
          }}
          className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Add to Collection
        </button>
      </div>
    </div>
  );
}
