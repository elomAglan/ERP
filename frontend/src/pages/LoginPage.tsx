// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner, 
  FaSignInAlt,
  FaExclamationTriangle
} from "react-icons/fa";

interface LoginPageProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ username: false, password: false });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation simple
    if (!username.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        username,
        password,
      });

      // Vérifie si la réponse contient un ID (login réussi)
      if (response.data.id) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("userId", response.data.id.toString());

        setIsAuthenticated(true);
        navigate("/dashboard", { replace: true });
      } else {
        setError(response.data.error || "Erreur de connexion");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur serveur. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Connexion</h1>
            <p className="text-blue-100 mt-2">Accédez à votre espace personnel</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
                <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none 
                  ${isFocused.username ? "text-blue-600" : "text-gray-400"}`}>
                  <FaUser />
                </div>
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setIsFocused({...isFocused, username: true})}
                  onBlur={() => setIsFocused({...isFocused, username: false})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none 
                  ${isFocused.password ? "text-blue-600" : "text-gray-400"}`}>
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused({...isFocused, password: true})}
                  onBlur={() => setIsFocused({...isFocused, password: false})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Connexion...
                </>
              ) : (
                <>
                  <FaSignInAlt className="mr-2" />
                  Se connecter
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Utilisez vos identifiants pour accéder au système</p>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Votre Application. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;