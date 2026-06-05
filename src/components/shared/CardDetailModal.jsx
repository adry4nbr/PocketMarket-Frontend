import { useState } from "react";
import { X, Repeat } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import TradeModal from "./TradeModal";
import AuctionTimer from "./AuctionTimer";

export default function CardDetailModal({
                                            card,
                                            onClose,
                                            onAddToCollection,
                                        }) {
    const { user } = useAuth();

    const [tradeModalOpen, setTradeModalOpen] = useState(false);
    const [bidValue, setBidValue] = useState("");
    const [bidMessage, setBidMessage] = useState("");

    if (!card) return null;

    function handleBid() {
        const bid = Number(bidValue);

        if (!bidValue) {
            setBidMessage("❌ Enter a bid amount");
            return;
        }

        if (bid <= (card.currentBid ?? 0)) {
            setBidMessage("❌ Bid must be higher than current bid");
            return;
        }

        setBidMessage("✅ Bid submitted successfully");
        setBidValue("");
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div
                    className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 flex gap-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Fechar */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
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
                        <div className="flex gap-2 mb-3 flex-wrap">
              <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                {card.rarity?.replace("_", " ")}
              </span>

                            <span className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                {card.condition}
              </span>

                            {card.isAuction && (
                                <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                   Auction Active
                </span>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {card.name}
                        </h2>

                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            {card.setName} • {card.rarity?.replace("_", " ")}
                        </p>

                        {/* Descrição */}
                        {card.description && (
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                    Description
                                </p>

                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {card.description}
                                </p>
                            </div>
                        )}

                        {/* Stock */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Stock
                            </p>

                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {card.stock} available
                            </p>
                        </div>

                        {/* Auction Info */}
                        {card.isAuction && (
                            <div className="mb-4 space-y-3">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                        Current Bid
                                    </p>

                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                        ${(card.currentBid ?? 0).toFixed(2)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                        Seller
                                    </p>

                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {card.seller}
                                    </p>
                                </div>

                                {card.endsAt && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                            Auction Ends
                                        </p>

                                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                            <AuctionTimer endsAt={card.endsAt} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Place Bid */}
                        {card.isAuction && user && (
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                    Place Bid
                                </p>

                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={bidValue}
                                        onChange={(e) => setBidValue(e.target.value)}
                                        placeholder="Enter bid"
                                        className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />

                                    <button
                                        onClick={handleBid}
                                        className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors"
                                    >
                                        Place Bid
                                    </button>
                                </div>

                                {bidMessage && (
                                    <p className="text-sm mt-2">
                                        {bidMessage}
                                    </p>
                                )}
                            </div>
                        )}

                        <hr className="my-4 border-gray-200 dark:border-gray-700" />

                        {/* Preço e ações */}
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
                                <button className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium px-5 py-2 rounded-xl cursor-not-allowed">
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