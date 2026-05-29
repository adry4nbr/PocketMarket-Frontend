import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchBar({ search, onSearchChange, filter, onFilterChange }) {
  const rarities = ["All", "COMMON", "UNCOMMON", "RARE", "HOLO_RARE", "ULTRA_RARE", "SECRET_RARE"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-blue-600 font-semibold">
        <Search size={18} />
        <span>Explore Cards</span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Input de busca */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 w-48"
          />
        </div>

        {/* Filtro de raridade */}
        <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-1.5">
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="text-sm text-gray-700 bg-transparent focus:outline-none cursor-pointer"
          >
            {rarities.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All" : r.replace("_", " ")}
              </option>
            ))}
          </select>
          <SlidersHorizontal size={14} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
