import { useState, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Shield,
  ChevronDown,
  Check,
} from "lucide-react";

const rarities = [
  { value: "All", label: "All" },
  { value: "COMMON", label: "Common" },
  { value: "UNCOMMON", label: "Uncommon" },
  { value: "RARE", label: "Rare" },
  { value: "HOLO_RARE", label: "Holo Rare" },
  { value: "ULTRA_RARE", label: "Ultra Rare" },
  { value: "SECRET_RARE", label: "Secret Rare" },
];

const conditions = [
  { value: "All", label: "All" },
  { value: "NM", label: "Near Mint" },
  { value: "LP", label: "Lightly Played" },
  { value: "MP", label: "Moderately Played" },
  { value: "HP", label: "Heavily Played" },
  { value: "DMG", label: "Damaged" },
];

const conditionBadge = {
  NM: "bg-green-100 text-green-800",
  LP: "bg-blue-100 text-blue-800",
  MP: "bg-amber-100 text-amber-800",
  HP: "bg-orange-100 text-orange-800",
  DMG: "bg-red-100 text-red-800",
};

function FilterDropdown({ icon: Icon, label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayVal = value === "All" ? "All" : value;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 hover:border-blue-400 transition-colors w-full"
      >
        <Icon size={14} className="text-blue-500 shrink-0" />
        <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">
          {label}
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
          {displayVal}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-150 ml-auto shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl z-50 overflow-hidden min-w-max">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {value === opt.value ? (
                <Check size={13} className="text-blue-500 shrink-0" />
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
              <span
                className={
                  value === opt.value
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-700 dark:text-gray-300"
                }
              >
                {opt.label}
              </span>
              {conditionBadge[opt.value] && (
                <span
                  className={`ml-auto text-xs font-medium px-1.5 py-0.5 rounded ${conditionBadge[opt.value]}`}
                >
                  {opt.value}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  condition,
  onConditionChange,
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex flex-col gap-3 transition-colors duration-200">
      {/* Linha 1: título + input + filtros (desktop) */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-blue-600 font-semibold shrink-0">
          <Search size={18} />
          <span>Explore Cards</span>
        </div>

        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Filtros na mesma linha — só no desktop */}
        <div className="hidden sm:flex gap-2 shrink-0">
          <FilterDropdown
            icon={SlidersHorizontal}
            label="Rarity:"
            options={rarities}
            value={filter}
            onChange={onFilterChange}
          />
          <FilterDropdown
            icon={Shield}
            label="Condition:"
            options={conditions}
            value={condition}
            onChange={onConditionChange}
          />
        </div>
      </div>

      {/* Linha 2: filtros abaixo — só no mobile */}
      <div className="flex gap-1 sm:hidden">
        <div className="flex-1">
          <FilterDropdown
            icon={SlidersHorizontal}
            label="Rarity:"
            options={rarities}
            value={filter}
            onChange={onFilterChange}
          />
        </div>
        <div className="flex-1">
          <FilterDropdown
            icon={Shield}
            label="Condition:"
            options={conditions}
            value={condition}
            onChange={onConditionChange}
          />
        </div>
      </div>
    </div>
  );
}
