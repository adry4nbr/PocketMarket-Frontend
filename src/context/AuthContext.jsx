import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  function _persist(userData, jwtToken) {
    // Se o token vier com "Bearer " (com ou sem espaço), removemos para salvar apenas o hash limpo
    const tokenPuro = jwtToken ? jwtToken.replace(/^Bearer\s+/i, "") : "";

    setUser(userData);
    setToken(tokenPuro);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenPuro); // 👈 Agora salva 100% limpo
  }

  async function loginRequest(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    // data: { token, email, name }
    _persist({ name: data.name, email: data.email }, data.token);
  }

  async function registerRequest(name, email, password) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    // data: { token, email, name }
    _persist({ name: data.name, email: data.email }, data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loginRequest, registerRequest, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
