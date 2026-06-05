import { X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TradeModal from "./TradeModal";
import { Repeat } from "lucide-react";

export default function CardDetailModal({
                                          card,
                                          onClose,
                                          onAddToCollection
                                        }) {
  const { user } = useAuth();
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  if (!card) return null;

  return (
      <>
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
          <div
              className="bg-white rounded-2xl max-w-2xl w-full p-6 flex gap-6 relative"
              onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Imagem */}
            <div className="w-56 flex-shrink-0">
              <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full rounded-xl"
                  onError={(e) => {
                    e.target.src =
                        "https://placehold.co/300x400?text=No+Image";
                  }}
              />
            </div>

            {/* Detalhes */}
            <div className="flex-1">
              {/* Badges */}
              <div className="flex gap-2 mb-3">
              <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                {card.rarity?.replace("_", " ")}
              </span>

                <span className="border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                {card.condition}
              </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {card.name}
              </h2>

              <p className="text-gray-500 text-sm mb-4">
                {card.setName} • {card.rarity?.replace("_", " ")}
              </p>

              {/* Descrição */}
              {card.description && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Description
                    </p>

                    <p className="text-sm text-gray-700">
                      {card.description}
                    </p>
                  </div>
              )}

              {/* Stock */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                  Stock
                </p>

                <p className="text-sm text-gray-700">
                  {card.stock} available
                </p>
              </div>

              <hr className="my-4" />

              {/* Preço e ações */}
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  ${card.price.toFixed(2)}
                </p>

                {user ? (
                    <div className="flex gap-2">
                      <button
                          onClick={() => {
                            onAddToCollection(card);
                            onClose();
                          }}
                          className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        + Add to Collection
                      </button>

                      <button
                          onClick={() => setTradeModalOpen(true)}
                          className="bg-green-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Repeat size={18} />
                        Trade Offer
                      </button>
                    </div>
                ) : (
                    <button className="bg-gray-100 text-gray-500 text-sm font-medium px-5 py-2 rounded-xl cursor-not-allowed">
                      Login to Collect
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <TradeModal
            isOpen={tradeModalOpen}
            onClose={() => setTradeModalOpen(false)}
            card={card}
        />
      </>
  );
}