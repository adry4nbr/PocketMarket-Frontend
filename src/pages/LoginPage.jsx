import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function LoginPage() {
  const { loginRequest } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("auth.loginMissing"));
      return;
    }

    try {
      setLoading(true);
      await loginRequest(email, password);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-2xl">
            <Sparkles size={28} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">
          {t("auth.loginTitle")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          {t("auth.loginSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={emailId}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
            >
              {t("auth.email")}
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              aria-describedby={error ? errorId : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label
                htmlFor={passwordId}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("auth.password")}
              </label>
              <span className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                {t("auth.forgotPassword")}
              </span>
            </div>
            <input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              required
              aria-describedby={error ? errorId : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          {error && (
            <p id={errorId} role="alert" className="text-red-500 dark:text-red-400 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.loginLoading") : t("auth.loginButton")}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {t("auth.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
