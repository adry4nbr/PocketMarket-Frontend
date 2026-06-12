import { useState, useEffect } from "react";
import { Check, Repeat, ShoppingBag } from "lucide-react";
import api from "../services/api";
import ConfirmationModal from "../components/shared/ConfirmationModal";
import { useLanguage } from "../context/LanguageContext";

const TABS = [
  { key: "sent", labelKey: "trades.tabs.sent" },
  { key: "received", labelKey: "trades.tabs.received" },
  { key: "purchases", labelKey: "trades.tabs.purchases" },
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
  const { locale, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("sent");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [tradeToAccept, setTradeToAccept] = useState(null);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: t("common.close"),
    cancelLabel: null,
    isDanger: false,
  });

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
        setError(t("trades.loadError"));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab, t]);

  async function handleAcceptTrade(trade) {
    try {
      setAcceptingId(trade.id);
      setTradeToAccept(null);
      const { data: acceptedTrade } = await api.patch(
        `/trade-offers/${trade.id}/accept`,
      );
      setData((prev) =>
        prev.map((item) => (item.id === trade.id ? acceptedTrade : item)),
      );
      setDialog({
        open: true,
        title: t("trades.acceptedTitle"),
        message: t("trades.acceptedMessage"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: false,
      });
    } catch (err) {
      setDialog({
        open: true,
        title: t("common.error"),
        message: err.response?.data?.message || t("trades.acceptError"),
        confirmLabel: t("common.close"),
        cancelLabel: null,
        isDanger: true,
      });
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Repeat size={24} className="text-blue-600 dark:text-blue-500" />
          {t("trades.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {t("trades.subtitle")}
        </p>
      </div>

      <hr className="mb-6 border-gray-200 dark:border-gray-800" />

      {/* Abas */}
      <div
        className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 sm:pb-0"
        role="tablist"
        aria-label={t("trades.tabLabel")}
      >
        {TABS.map(({ key, labelKey }) => (
          <button
            type="button"
            key={key}
            onClick={() => setActiveTab(key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            role="tab"
            aria-selected={activeTab === key}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Estados */}
      {loading && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">{t("trades.loading")}</p>
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
            {t("trades.empty")}
          </p>
          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
            {activeTab === "purchases"
              ? t("trades.emptyPurchases")
              : t("trades.emptyTrades")}
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
                    {t("trades.proposal")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusStyle(trade.status)}`}
                  >
                    {trade.status}
                  </span>

                  {activeTab === "received" &&
                    trade.status?.toUpperCase() === "PENDING" && (
                      <button
                        type="button"
                        disabled={acceptingId === trade.id}
                        onClick={() => setTradeToAccept(trade)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check size={14} />
                        {acceptingId === trade.id
                          ? t("trades.accepting")
                          : t("trades.accept")}
                      </button>
                    )}
                </div>
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
                    {purchase.type === "AUCTION"
                      ? t("common.auction")
                      : t("common.directPurchase")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t("trades.seller")}{" "}
                    <span className="font-medium">{purchase.sellerName}</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(purchase.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {purchase.amount}
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

      {tradeToAccept && (
        <ConfirmationModal
          isOpen={Boolean(tradeToAccept)}
          title={t("trades.acceptTitle")}
          message={t("trades.acceptMessage")}
          confirmLabel={t("trades.accept")}
          cancelLabel={t("common.cancel")}
          onConfirm={() => handleAcceptTrade(tradeToAccept)}
          onCancel={() => setTradeToAccept(null)}
          onClose={() => setTradeToAccept(null)}
        />
      )}

      <ConfirmationModal
        isOpen={dialog.open}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        cancelLabel={dialog.cancelLabel}
        isDanger={dialog.isDanger}
        onConfirm={() => setDialog((prev) => ({ ...prev, open: false }))}
        onCancel={() => setDialog((prev) => ({ ...prev, open: false }))}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
