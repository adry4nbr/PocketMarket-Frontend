import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import {
  uploadProofImage,
  addUserCard,
  addToCollection,
} from "../../services/collectionService";
import { useLanguage } from "../../context/LanguageContext";

const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"];

export default function AddCardModal({ card, onClose, onSuccess }) {
  const { t } = useLanguage();
  const titleId = useId();
  const conditionId = useId();
  const proofId = useId();
  const errorId = useId();
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
      setError(t("addCard.proofRequired"));
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
      setError(err.response?.data?.message ?? t("addCard.addError"));
    }
  };

  const isLoading = ["uploading", "saving"].includes(step);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 relative border-t sm:border border-gray-100 dark:border-gray-700 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
      >
        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label={t("addCard.close")}
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
            <h2 id={titleId} className="font-bold text-gray-900 dark:text-gray-100">
              {card.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {card.setName} • {card.rarity}
            </p>
          </div>
        </div>

        {/* Condição */}
        <div className="mb-4">
          <label
            htmlFor={conditionId}
            className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1"
          >
            {t("addCard.condition")}
          </label>
          <select
            id={conditionId}
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
          <label
            htmlFor={proofId}
            className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1"
          >
            {t("addCard.proof")}
          </label>
          <input
            id={proofId}
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
              alt={t("addCard.proofPreview")}
              className="w-full h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
            />
          </div>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-500 mb-4">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {step === "uploading" && t("addCard.uploading")}
          {step === "saving" && t("addCard.saving")}
          {!isLoading && t("addCard.confirm")}
        </button>
      </div>
    </div>
  );
}
