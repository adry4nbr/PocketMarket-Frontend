import { mockCollection } from "../../mock/cards";

export default function TradeModal({ isOpen, onClose, card }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-125"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-2">Propor troca por {card.name}</h2>

        <p className="text-gray-500 mb-4">Escolha uma carta da sua coleção:</p>

        <div className="space-y-3">
          {mockCollection.map((myCard) => (
            <div
              key={myCard.collectionId}
              className="border rounded-lg p-3 flex items-center gap-3"
            >
              <img
                src={myCard.imageUrl}
                alt={myCard.cardName}
                className="w-16 rounded"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{myCard.cardName}</h3>

                <p className="text-sm text-gray-500">{myCard.setName}</p>
              </div>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                onClick={() => {
                  alert(`Proposta enviada: ${myCard.cardName} → ${card.name}`);
                  onClose();
                }}
              >
                Oferecer
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 py-2 rounded-lg"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
