import { useState, useRef, useEffect, useId } from "react";
import {
  Search,
  SlidersHorizontal,
  Shield,
  ChevronDown,
  Check,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const rarities = [
  { value: "All", labelKey: "search.all" },
  { value: "Common", labelKey: "search.rarities.Common" },
  { value: "Uncommon", labelKey: "search.rarities.Uncommon" },
  { value: "Rare", labelKey: "search.rarities.Rare" },
  { value: "Rare Holo", labelKey: "search.rarities.Rare Holo" },
  { value: "Promo", labelKey: "search.rarities.Promo" },
  { value: "Rare Holo EX", labelKey: "search.rarities.Rare Holo EX" },
  { value: "Ultra Rare", labelKey: "search.rarities.Ultra Rare" },
  { value: "Secret Rare", labelKey: "search.rarities.Secret Rare" },
];

const conditions = [
  { value: "All", labelKey: "search.all" },
  { value: "NM", labelKey: "search.conditions.NM" },
  { value: "LP", labelKey: "search.conditions.LP" },
  { value: "MP", labelKey: "search.conditions.MP" },
  { value: "HP", labelKey: "search.conditions.HP" },
  { value: "DMG", labelKey: "search.conditions.DMG" },
];

const conditionBadge = {
  NM: "bg-green-100 text-green-800",
  LP: "bg-blue-100 text-blue-800",
  MP: "bg-amber-100 text-amber-800",
  HP: "bg-orange-100 text-orange-800",
  DMG: "bg-red-100 text-red-800",
};

function FilterDropdown({ icon: Icon, label, options, value, onChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const buttonId = useId();
  const listId = useId();
  const ref = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selected = options.find((opt) => opt.value === value);
  const displayVal = selected ? t(selected.labelKey) : value;

  return (
    <div className="relative" ref={ref}>
      <button
        id={buttonId}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 hover:border-blue-400 transition-colors w-full"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label} ${displayVal}`}
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
        <div
          id={listId}
          className="absolute right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl z-50 overflow-hidden min-w-max"
          role="listbox"
          aria-labelledby={buttonId}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              role="option"
              aria-selected={value === opt.value}
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
                {t(opt.labelKey)}
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
  const { t } = useLanguage();
  const searchId = useId();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex flex-col gap-3 transition-colors duration-200">
      {/* Linha 1: título + input + filtros (desktop) */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-blue-600 font-semibold shrink-0">
          <Search size={18} />
          <span>{t("search.explore")}</span>
        </div>

        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id={searchId}
            type="text"
            aria-label={t("search.searchLabel")}
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Filtros na mesma linha — só no desktop */}
        <div className="hidden sm:flex gap-2 shrink-0">
          <FilterDropdown
            icon={SlidersHorizontal}
            label={t("search.rarity")}
            options={rarities}
            value={filter}
            onChange={onFilterChange}
          />
          <FilterDropdown
            icon={Shield}
            label={t("search.condition")}
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
            label={t("search.rarity")}
            options={rarities}
            value={filter}
            onChange={onFilterChange}
          />
        </div>
        <div className="flex-1">
          <FilterDropdown
            icon={Shield}
            label={t("search.condition")}
            options={conditions}
            value={condition}
            onChange={onConditionChange}
          />
        </div>
      </div>
    </div>
  );
}
