import { useState } from "react";
import { X } from "lucide-react";
import {
  uploadProofImage,
  addUserCard,
  addToCollection,
} from "../../services/collectionService";

const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"];

export default function AddCardModal({ card, onClose, onSuccess }) {
  const [condition, setCondition] = useState("NM");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState("idle");
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Anexe uma foto de prova.");
      return;
    }
    setError("");

    try {
      setStep("uploading");
      const { data: uploadData } = await uploadProofImage(file);

      setStep("saving");
      const { data: userCard } = await addUserCard(
        card.externalCardId,
        condition,
        uploadData.url,
      );

      await addToCollection(userCard.id);

      setStep("done");
      onSuccess();
    } catch (err) {
      setStep("error");
      setError(err.response?.data?.message ?? "Erro ao adicionar carta.");
    }
  };

  const isLoading = ["uploading", "saving"].includes(step);

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 relative border-t sm:border border-gray-100 dark:border-gray-700 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header com imagem */}
        <div className="flex items-center gap-3 mb-5">
          <img
            src={card.imageLargeUrl ?? card.imageSmallUrl}
            alt={card.name}
            className="w-12 rounded-lg"
            onError={(e) => {
              e.target.src = "https://placehold.co/48x64?text=?";
            }}
          />
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100">
              {card.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {card.setName} • {card.rarity}
            </p>
          </div>
        </div>

        {/* Condição */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
            Condição
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 text-sm"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Upload foto */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
            Foto de prova
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-950 dark:file:text-blue-400 hover:file:bg-blue-100"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="preview"
              className="w-full h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {step === "uploading" && "📤 Enviando imagem..."}
          {step === "saving" && "💾 Salvando..."}
          {!isLoading && "Confirmar"}
        </button>
      </div>
    </div>
  );
}
