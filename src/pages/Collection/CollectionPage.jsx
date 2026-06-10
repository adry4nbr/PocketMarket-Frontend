import { useState } from "react";
import { BarChart2, Search } from "lucide-react";
import CatalogSearch from "./CatalogSearch";
import MyCollection from "./MyCollection";

const TABS = [
  { key: "collection", label: "My Collection", icon: BarChart2 },
  { key: "catalog", label: "Search Catalog", icon: Search },
];

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState("collection");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-3 sm:px-6 py-6 sm:py-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Collection
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Search the catalog and manage your cards.
        </p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activeTab === "collection" && <MyCollection />}
      {activeTab === "catalog" && <CatalogSearch />}
    </div>
  );
}
