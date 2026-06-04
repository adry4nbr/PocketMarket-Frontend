import { useState } from "react";
import { Repeat } from "lucide-react";
import { sentTrades, receivedTrades } from "../mock/trades";

export default function TradesPage() {
  const [activeTab, setActiveTab] = useState("sent");

  const trades = activeTab === "sent" ? sentTrades : receivedTrades;

  function getStatusStyle(status) {
    switch (status) {
      case "Aceito":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Recusado":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Repeat size={24} className="text-blue-600 dark:text-blue-500" />
          Trade Proposals
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your card exchange offers.
        </p>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-800" />

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 sm:pb-0">
        <button
          onClick={() => setActiveTab("sent")}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "sent"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          Sent ({sentTrades.length})
        </button>

        <button
          onClick={() => setActiveTab("received")}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "received"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          Received ({receivedTrades.length})
        </button>
      </div>

      {/* Conteúdo */}
      {trades.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-200">
            No trade proposals yet.
          </p>

          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
            Trade offers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-5 transition-colors duration-200"
            >
              {/* Ajustado para flex-col no mobile e flex-row no desktop */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center flex-wrap gap-1">
                    <span>{trade.offeredCard}</span>
                    <span className="text-gray-400 dark:text-gray-500 mx-1">
                      →
                    </span>
                    <span>{trade.requestedCard}</span>
                  </p>

                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Pokémon card trade proposal
                  </p>
                </div>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusStyle(
                    trade.status,
                  )}`}
                >
                  {trade.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
