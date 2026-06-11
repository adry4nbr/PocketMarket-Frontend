import { useState, useEffect, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Search,
  BarChart2,
  Heart,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Repeat,
  Megaphone,
  Languages,
  Coins,
} from "lucide-react";
import api from "../../services/api";
import AddCreditModal from "./AddCreditModal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, t, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/users/me/credits");
      setCredits(data.credits ?? 0);
    } catch (err) {
      console.error("Erro ao buscar créditos:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchCredits();
  }, [fetchCredits, user]);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <>
      <nav
        className="bg-white/95 dark:bg-gray-900/95 shadow-[0_1px_0_0_#ded8ce] dark:shadow-[0_1px_0_0_#3a3733] backdrop-blur px-4 sm:px-6 py-3 sticky top-0 z-50 transition-colors duration-200"
        aria-label={t("nav.navigation")}
      >
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            className="flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <div className="pokeball-mark h-8 w-8 rounded-full shrink-0" aria-hidden="true" />
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              PocketMarket
            </span>
          </NavLink>

          {user && (
            <div className="hidden md:flex items-center gap-6">
              <NavLink
                to="/"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Search size={16} />
                {t("nav.marketplace")}
              </NavLink>
              <NavLink
                to="/collection"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <BarChart2 size={16} />
                {t("nav.collection")}
              </NavLink>
              <NavLink
                to="/favorites"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Heart size={16} />
                {t("nav.favorites")}
              </NavLink>
              <NavLink
                to="/my-listings"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Megaphone size={16} />
                {t("nav.listings")}
              </NavLink>
              <NavLink
                to="/trades"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Repeat size={16} />
                {t("nav.trades")}
              </NavLink>
            </div>
          )}

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsCreditModalOpen(true)}
                  className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 px-3 py-1.5 rounded-full font-bold hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors text-sm"
                  title="Adicionar Créditos"
                >
                  <Coins size={16} />
                  <span>{credits}</span>
                </button>
                <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User size={16} />
                  {user.name}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label={t("nav.logout")}
                  title={t("nav.logout")}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="text-sm font-medium px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {t("nav.login")}
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-sm shadow-red-900/10"
                >
                  ✦ {t("nav.signup")}
                </NavLink>
              </>
            )}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t("nav.switchToEnglish")}
              title={t("nav.switchToEnglish")}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
            >
              <Languages size={15} />
              {language.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t("nav.themeToggle", {
                mode: theme === "dark" ? t("nav.light") : t("nav.dark"),
              })}
              title={t("nav.themeToggle", {
                mode: theme === "dark" ? t("nav.light") : t("nav.dark"),
              })}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t("nav.themeToggle", {
                mode: theme === "dark" ? t("nav.light") : t("nav.dark"),
              })}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors p-1"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t("nav.switchToEnglish")}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
            >
              <Languages size={15} />
              {language.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors p-1"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-navigation"
            className="md:hidden mt-3 pb-3 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-1 pt-3"
          >
            {user ? (
              <>
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <User size={16} />
                  {user.name}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsCreditModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl transition-colors font-medium w-full text-left"
                >
                  <Coins size={16} />
                  Créditos: {credits}
                </button>
                <NavLink
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Search size={16} />
                  Marketplace
                </NavLink>
                <NavLink
                  to="/collection"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <BarChart2 size={16} />
                  My Collection
                </NavLink>
                <NavLink
                  to="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart size={16} />
                  Favorites
                </NavLink>
                <NavLink
                  to="/my-listings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Megaphone size={16} />
                  My Listings
                </NavLink>
                <NavLink
                  to="/trades"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Repeat size={16} />
                  Trades
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl transition-colors w-full text-left"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {t("nav.login")}
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="px-2 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-colors"
                >
                  ✦ {t("nav.signup")}
                </NavLink>
              </>
            )}
          </div>
        )}
      </nav>

      {isCreditModalOpen && (
        <AddCreditModal
          onClose={() => setIsCreditModalOpen(false)}
          onSuccess={fetchCredits}
        />
      )}
    </>
  );
}
