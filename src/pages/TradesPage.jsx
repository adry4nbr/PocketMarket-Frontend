import { useState, useEffect } from "react";
import { Repeat, ShoppingBag } from "lucide-react";
import api from "../services/api";

const TABS = [
  { key: "sent", label: "Sent Trades" },
  { key: "received", label: "Received Trades" },
  { key: "purchases", label: "My Purchases" },
];

function getStatusStyle(status) {
  switch (status?.toUpperCase()) {
    case "ACCEPTED":
    case "COMPLETED":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "REJECTED":
    case "CANCELED":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  }
}

export default function TradesPage() {
  const [activeTab, setActiveTab] = useState("sent");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      setData([]);
      try {
        if (activeTab === "sent") {
          const res = await api.get("/trade-offers/sent");
          setData(Array.isArray(res.data) ? res.data : [res.data]);
        } else if (activeTab === "received") {
          const res = await api.get("/trade-offers/received");
          setData(Array.isArray(res.data) ? res.data : [res.data]);
        } else {
          const res = await api.get("/purchases/my-purchases", {
            params: { page: 0, size: 50 },
          });
          setData(res.data.content ?? []);
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Repeat size={24} className="text-blue-600 dark:text-blue-500" />
          My Trades & Purchases
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your trade offers and purchase history.
        </p>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-800" />

      {/* Abas */}
      <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 sm:pb-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Estados */}
      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Loading...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-200">
            Nothing here yet.
          </p>
          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
            {activeTab === "purchases"
              ? "Your purchase history will appear here."
              : "Trade offers will appear here."}
          </p>
        </div>
      )}

      {/* Trades (sent / received) */}
      {!loading && !error && data.length > 0 && activeTab !== "purchases" && (
        <div className="space-y-4">
          {data.map((trade) => (
            <div
              key={trade.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-5 transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {trade.sender}
                    <span className="text-gray-400 dark:text-gray-500 mx-2">
                      →
                    </span>
                    {trade.receiver}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Pokémon card trade proposal
                  </p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusStyle(trade.status)}`}
                >
                  {trade.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchases */}
      {!loading && !error && data.length > 0 && activeTab === "purchases" && (
        <div className="space-y-4">
          {data.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-5 transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-blue-600" />
                    {purchase.type === "AUCTION" ? "Leilão" : "Compra Direta"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Vendedor:{" "}
                    <span className="font-medium">{purchase.sellerName}</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(purchase.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {purchase.amount} cr
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium w-fit mt-1 ${getStatusStyle(purchase.status)}`}
                  >
                    {purchase.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
