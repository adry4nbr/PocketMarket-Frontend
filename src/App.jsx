import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/shared/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CollectionPage from "./pages/Collection/CollectionPage";
import FavoritesPage from "./pages/FavoritesPage";
import TradesPage from "./pages/TradesPage";
import MyListingsPage from "./pages/MyListingsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
