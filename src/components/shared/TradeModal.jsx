import { useState, useEffect } from "react";
import api from "../../services/api";

export default function TradeModal({ isOpen, onClose, card }) {
  const [myCards, setMyCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const controller = new AbortController();

    setLoading(true); // eslint-disable-line react-hooks/exhaustive-deps
    setError("");

    api
      .get("/user-cards/me?page=0&size=100", { signal: controller.signal })
      .then(({ data }) => {
        if (!cancelled) {
          const availableCards = (data.content || []).filter(
            (c) => c.status === "AVAILABLE",
          );
          setMyCards(availableCards);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError("Erro ao carregar sua coleção.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isOpen]);

  async function handleOfferTrade(myCardId) {
    try {
      setSubmitting(true);
      setError("");
      await api.post("/trade-offers", {
        receiverId: card.sellerId,
        offeredCardIds: [myCardId],
        requestedCardIds: [card.userCardId],
      });
      alert(`Proposta enviada: Troca por ${card.name} realizada com sucesso!`);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Erro ao enviar proposta de troca.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl w-125 max-w-[90vw] border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Propor troca por {card.name}
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Escolha uma carta da sua coleção para oferecer:
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {loading ? (
            <p className="text-center text-gray-500 py-4">
              Carregando coleção...
            </p>
          ) : myCards.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Nenhuma carta disponível para troca na sua coleção.
            </p>
          ) : (
            myCards.map((myCard) => (
              <div
                key={myCard.id}
                className="border dark:border-gray-700 rounded-lg p-3 flex items-center gap-3 bg-white dark:bg-gray-800"
              >
                <img
                  src={myCard.card.imageSmallUrl || myCard.card.imageLargeUrl}
                  alt={myCard.card.name}
                  className="w-16 rounded object-cover"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/100x140?text=No+Image";
                  }}
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {myCard.card.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {myCard.card.setName}
                  </p>
                  <p className="text-xs font-medium mt-1 text-green-600 dark:text-green-400">
                    {myCard.condition}
                  </p>
                </div>

                <button
                  disabled={submitting}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  onClick={() => handleOfferTrade(myCard.id)}
                >
                  {submitting ? "..." : "Oferecer"}
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          disabled={submitting}
          className="mt-4 w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
