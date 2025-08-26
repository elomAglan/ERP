import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProfileManagementPage: React.FC = () => {
  // State variables for username management
  const [username, setUsername] = useState<string>("");
  const [initialUsername, setInitialUsername] = useState<string>(""); // To reset username if cancel editing
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);

  // State variables for password management
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  // State variables for user feedback messages
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  // State variable for user ID, typically fetched from authentication context
  const [userId, setUserId] = useState<number | null>(null);

  // Effect hook to load user data from local storage on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("userId");
    if (storedUsername) {
      setUsername(storedUsername);
      setInitialUsername(storedUsername); // Store initial username for cancellation
    } else {
      setUsername("Guest User"); // Default if not found
      setInitialUsername("Guest User");
    }
    if (storedUserId) {
      setUserId(Number(storedUserId));
    } else {
      // For demonstration, set a dummy user ID if not found
      setUserId(1);
    }
  }, []);

  /**
   * Displays a feedback message to the user for a short period.
   * @param msg The message to display.
   * @param type The type of message (success, error, info) for styling.
   */
  const showFeedback = (msg: string, type: "success" | "error" | "info") => {
    setMessage(msg);
    setMessageType(type);
    // Automatically clear the message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  };

  /**
   * Handles the update of the username.
   * Prevents empty usernames and sends a PUT request to the backend.
   * @param e The form event.
   */
  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showFeedback("Le nom d'utilisateur ne peut pas être vide.", "error");
      return;
    }
    if (!userId) {
      showFeedback("Utilisateur non identifié pour la mise à jour.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/update-username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, newUsername: username }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("username", username);
        setInitialUsername(username); // Update initial username after successful save
        showFeedback(data.message, "success");
        setIsEditingUsername(false); // Exit editing mode
      } else {
        showFeedback(data.error || "Erreur lors de la mise à jour du nom d'utilisateur.", "error");
      }
    } catch (error) {
      console.error("Erreur réseau ou du serveur:", error);
      showFeedback("Erreur réseau, veuillez réessayer.", "error");
    }
  };

  /**
   * Handles the change of the user's password.
   * Validates inputs (non-empty, matching new passwords, minimum length)
   * and sends a PUT request to the backend.
   * @param e The form event.
   */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showFeedback("Veuillez remplir tous les champs du mot de passe.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showFeedback("Les nouveaux mots de passe ne correspondent pas.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showFeedback("Le nouveau mot de passe doit contenir au moins 6 caractères.", "error");
      return;
    }
    if (!userId) {
      showFeedback("Utilisateur non identifié pour le changement de mot de passe.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, currentPassword, newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        showFeedback(data.message, "success");
        // Clear password fields on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        showFeedback(data.error || "Erreur lors du changement de mot de passe.", "error");
      }
    } catch (error) {
      console.error("Erreur réseau ou du serveur:", error);
      showFeedback("Erreur réseau, veuillez réessayer.", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-8 min-h-screen bg-gray-100 text-gray-900 font-sans"
    >
      {/* Feedback message banner - fixed at the top */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg text-white text-center w-11/12 max-w-md
              ${messageType === "success" ? "bg-green-600" : messageType === "error" ? "bg-red-600" : "bg-blue-600"}
              flex items-center justify-center gap-2`}
            role="alert" // Accessibility role
          >
            {messageType === "success" && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>}
            {messageType === "error" && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>}
            {messageType === "info" && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-blue-700 flex items-center gap-3">
          <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" fillRule="evenodd"></path></svg> Gestion du Profil
        </h1>

        {/* Username Management Card */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" fillRule="evenodd"></path></svg> Nom d'utilisateur
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {isEditingUsername ? (
              <form onSubmit={handleUsernameUpdate} className="flex flex-col sm:flex-row flex-grow w-full items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  placeholder="Nouveau nom d'utilisateur"
                  required
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 shadow-md"
                    title="Sauvegarder le nom d'utilisateur"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3H2V1h5a1 1 0 011 1v1zm0 16H2v-2h5a1 1 0 011 1v1zM11 1h-2v2h2V1zm0 16h-2v2h2v-2zM15 1h-2v2h2V1zm0 16h-2v2h2v-2zM19 1h-2v2h2V1zm0 16h-2v2h2v-2zM2 7h2v2H2V7zm16 0h-2v2h2V7zm-2 4h-2v2h2v-2zM4 11h2v2H4v-2zm-2 4h2v2H2v-2zm16 0h-2v2h2v-2zm-2-8h2V5h-2v2zM4 5h2V3H4v2zm12 0h2V3h-2v2zM6 1h2v2H6V1zm0 16h2v2H6v-2z" fillRule="evenodd" clipRule="evenodd"></path></svg> Sauvegarder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsername(initialUsername); // Reset to the username loaded from local storage
                    }}
                    className="flex-1 sm:flex-none px-5 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 shadow-md"
                    title="Annuler"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg> Annuler
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-lg sm:text-xl font-medium text-gray-800 break-words">{username}</p>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 shadow-md"
                  title="Modifier le nom d'utilisateur"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-7.5 7.5a1 1 0 00-1.414 1.414L10 17.414l5-5V12a1 1 0 00-1-1h-1a1 1 0 00-1-1h-1a1 1 0 00-1-1H7.086z" fillRule="evenodd" clipRule="evenodd"></path></svg> Modifier
                </button>
              </>
            )}
          </div>
        </section>

        {/* Password Change Card */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2h2a2 2 0 012 2v5a2 2 0 01-2 2H3a2 2 0 01-2-2v-5a2 2 0 012-2h2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg> Changer le mot de passe
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label htmlFor="currentPassword" className="block text-base font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-base font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-base font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 shadow-md"
              title="Changer le mot de passe"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3H2V1h5a1 1 0 011 1v1zm0 16H2v-2h5a1 1 0 011 1v1zM11 1h-2v2h2V1zm0 16h-2v2h2v-2zM15 1h-2v2h2V1zm0 16h-2v2h2v-2zM19 1h-2v2h2V1zm0 16h-2v2h2v-2zM2 7h2v2H2V7zm16 0h-2v2h2V7zm-2 4h-2v2h2v-2zM4 11h2v2H4v-2zm-2 4h2v2H2v-2zm16 0h-2v2h2v-2zm-2-8h2V5h-2v2zM4 5h2V3H4v2zm12 0h2V3h-2v2zM6 1h2v2H6V1zm0 16h2v2H6v-2z" fillRule="evenodd" clipRule="evenodd"></path></svg> Changer le mot de passe
            </button>
          </form>
        </section>
      </div>
    </motion.div>
  );
};

export default ProfileManagementPage;
