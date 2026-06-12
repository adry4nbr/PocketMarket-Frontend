import { useState } from "react";
import { X, Coins } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function jwtDecode(token) {
  if (typeof token !== "string") {
    throw new Error("Invalid token specified: must be a string");
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid token specified: missing part");
  }

  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const decoded = decodeURIComponent(
    atob(payload)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(decoded);
}

export default function AddCreditModal({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Informe um valor válido.");
      return;
    }

    setLoading(true);
    try {
      // Extrai o payload do token JWT
      const decoded = jwtDecode(token);

      // Tenta pegar o ID de onde o Spring Security costuma colocar (sub, id ou userId)
      const userId = decoded.id || decoded.userId || decoded.sub;

      await api.patch(`/users/credit/${userId}`, {
        credits: Number(amount),
      });

      setLoading(false);
      onSuccess?.(); // Avisa a Navbar para atualizar o saldo
      onClose(); // Fecha o modal
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao adicionar créditos.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 relative shadow-xl border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-xl">
            <Coins size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Adicionar Fundos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Compre mais créditos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              Valor (Créditos)
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 500"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Processando..." : "Confirmar Pagamento"}
          </button>
        </form>
      </div>
    </div>
  );
}
