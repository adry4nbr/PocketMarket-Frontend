export default function TradeModal({
                                       isOpen,
                                       onClose,
                                       card
                                   }) {
    if (!isOpen) return null;

    const myCards = [
        { id: 1, name: "Pikachu" },
        { id: 2, name: "Mewtwo" },
        { id: 3, name: "Gengar" }
    ];

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-xl w-96"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">
                    Propor troca por {card.name}
                </h2>

                <p className="text-gray-500 mb-4">
                    Escolha uma carta da sua coleção:
                </p>

                <div className="space-y-2">
                    {myCards.map((myCard) => (
                        <button
                            key={myCard.id}
                            className="w-full border p-3 rounded-lg hover:bg-gray-100"
                            onClick={() => {
                                alert(
                                    `Proposta enviada: ${myCard.name} por ${card.name}`
                                );
                                onClose();
                            }}
                        >
                            {myCard.name}
                        </button>
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