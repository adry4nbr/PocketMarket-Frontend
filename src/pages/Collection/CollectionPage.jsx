import { useState } from "react";
import { BarChart2, Search } from "lucide-react";
import CatalogSearch from "./CatalogSearch";
import MyCollection from "./MyCollection";
import AllUserCards from "./AllUserCards";
import { useLanguage } from "../../context/LanguageContext";

const TABS = [
  { key: "collection", labelKey: "collection.tabs.collection", icon: BarChart2 },
  { key: "catalog", labelKey: "collection.tabs.catalog", icon: Search },
  { key: "all", labelKey: "collection.tabs.allCards", icon: Search },
];

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState("collection");
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-3 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("collection.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {t("collection.subtitle")}
        </p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-6" role="tablist" aria-label={t("collection.tabLabel")}>
        {TABS.map(({ key, labelKey, icon: Icon }) => (
          <button
            type="button"
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            role="tab"
            aria-selected={activeTab === key}
          >
            <Icon size={15} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <section role="tabpanel">
        {activeTab === "collection" && <MyCollection />}
        {activeTab === "catalog" && <CatalogSearch />}
        {activeTab === "all" && <AllUserCards />}
      </section>
    </div>
  );
}
