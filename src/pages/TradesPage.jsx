import { useState } from "react";
import { Repeat } from "lucide-react";
import { sentTrades, receivedTrades } from "../mock/trades";

export default function TradesPage() {
    const [activeTab, setActiveTab] = useState("sent");

    const trades =
        activeTab === "sent"
            ? sentTrades
            : receivedTrades;

    function getStatusStyle(status) {
        switch (status) {
            case "Accepted":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "Rejected":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-8 transition-colors duration-200">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Repeat size={24} className="text-blue-600" />
                    Trade Proposals
                </h1>

                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Manage your card exchange offers.
                </p>
            </div>

            <hr className="mb-6 border-gray-200 dark:border-gray-700" />

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab("sent")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === "sent"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                >
                    Sent ({sentTrades.length})
                </button>

                <button
                    onClick={() => setActiveTab("received")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === "received"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                >
                    Received ({receivedTrades.length})
                </button>
            </div>

            {/* Conteúdo */}
            {trades.length === 0 ? (
                <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                    <p className="text-lg font-medium">
                        No trade proposals yet.
                    </p>

                    <p className="text-sm mt-1">
                        Trade offers will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {trades.map((trade) => (
                        <div
                            key={trade.id}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                        {trade.offeredCard}
                                        <span className="mx-2">→</span>
                                        {trade.requestedCard}
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Pokemon card trade proposal
                                    </p>
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                        trade.status
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