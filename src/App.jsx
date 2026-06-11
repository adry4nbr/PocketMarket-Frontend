import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import Navbar from "./components/shared/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CollectionPage from "./pages/Collection/CollectionPage";
import FavoritesPage from "./pages/FavoritesPage";
import TradesPage from "./pages/TradesPage";
import MyListingsPage from "./pages/MyListingsPage";

export default function App() {
  const { t } = useLanguage();

  return (
    <AuthProvider>
      <BrowserRouter>
        <a href="#main-content" className="skip-link">
          {t("accessibility.skipMain")}
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/trades" element={<TradesPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
