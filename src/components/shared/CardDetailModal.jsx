import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function CardDetailModal({ card, onClose, onAddToCollection }) {
  const { user } = useAuth();

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 flex gap-6 relative border border-gray-100 dark:border-gray-700 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-56 shrink-0">
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full rounded-xl"
            onError={(e) => {
              e.target.src = "https://placehold.co/300x400?text=No+Image";
            }}
          />
        </div>

        <div className="flex-1">
          <div className="flex gap-2 mb-3">
            <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              {card.rarity?.replace("_", " ")}
            </span>
            <span className="border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1 rounded-full">
              {card.condition}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {card.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {card.setName} • {card.rarity?.replace("_", " ")}
          </p>

          {card.description && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {card.description}
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              Stock
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {card.stock} available
            </p>
          </div>

          <hr className="my-4 border-gray-200 dark:border-gray-700" />

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${card.price.toFixed(2)}
            </p>
            {user ? (
              <button
                onClick={() => {
                  onAddToCollection(card);
                  onClose();
                }}
                className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                + Add to Collection
              </button>
            ) : (
              <button className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium px-5 py-2 rounded-xl cursor-not-allowed">
                Login to Collect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
