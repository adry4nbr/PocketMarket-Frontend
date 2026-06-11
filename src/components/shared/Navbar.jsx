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
  Coins,
} from "lucide-react";
import api from "../../services/api";
import AddCreditModal from "./AddCreditModal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCredits();
  }, [fetchCredits]);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-[0_1px_0_0_#e5e7eb] dark:shadow-[0_1px_0_0_#374151] px-4 sm:px-6 py-3 sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shrink-0">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              PocketMarket
            </span>
          </NavLink>

          {/* Nav Links — desktop */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <NavLink
                to="/"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Search size={16} />
                Marketplace
              </NavLink>
              <NavLink
                to="/collection"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <BarChart2 size={16} />
                My Collection
              </NavLink>
              <NavLink
                to="/favorites"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Heart size={16} />
                Favorites
              </NavLink>
              <NavLink
                to="/my-listings"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Megaphone size={16} />
                My Listings
              </NavLink>
              <NavLink
                to="/trades"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Repeat size={16} />
                Trades
              </NavLink>
            </div>
          )}

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* INSERÇÃO: Botão de Créditos Desktop */}
                <button
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
                  onClick={handleLogout}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label="Logout"
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
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-800 transition-colors flex items-center gap-1"
                >
                  ✦ Cadastre-se
                </NavLink>
              </>
            )}
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile: tema + hambúrguer */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors p-1"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors p-1"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Dropdown mobile */}
        {menuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-1 pt-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <User size={16} />
                  {user.name}
                </div>

                {/* INSERÇÃO: Botão de Créditos Mobile */}
                <button
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
                  onClick={handleLogout}
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
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="px-2 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-colors"
                >
                  ✦ Cadastre-se
                </NavLink>
              </>
            )}
          </div>
        )}
      </nav>

      {/* INSERÇÃO: Renderização do Modal */}
      {isCreditModalOpen && (
        <AddCreditModal
          onClose={() => setIsCreditModalOpen(false)}
          onSuccess={fetchCredits}
        />
      )}
    </>
  );
}
