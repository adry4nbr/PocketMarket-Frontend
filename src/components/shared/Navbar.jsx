import { useNavigate, NavLink } from "react-router-dom";
import { Search, BarChart2, Heart, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
        <span className="font-bold text-lg">PocketMarket</span>
      </NavLink>

      {/* Nav Links — só aparece quando logado */}
      {user && (
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Search size={16} />
            Marketplace
          </NavLink>
          <NavLink
            to="/collection"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <BarChart2 size={16} />
            My Collection
          </NavLink>
          <NavLink
            to="/favorites"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Heart size={16} />
            Favorites
          </NavLink>
        </div>
      )}

      {/* Auth */}
      {user ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <User size={16} />
            {user.name}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <NavLink
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-full text-gray-700 hover:bg-blue-600 hover:text-white transition-colors"
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-800 transition-colors flex items-center gap-1"
          >
            ✦ Cadastre-se
          </NavLink>
        </div>
      )}
    </nav>
  );
}
