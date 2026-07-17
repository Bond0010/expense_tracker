import { useState, useEffect } from "react";
import logo from "../assets/logo.jpg"; // 🔑 Make sure this path points to your logo

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [darkMode, setDarkMode] = useState(false);

  // Persist dark mode in localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Load dark mode preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") setDarkMode(true);
  }, []);

  return (
    <div className="h-16 flex items-center justify-between px-6 shadow-md bg-white dark:bg-gray-800 transition-colors">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
        <h1 className="font-bold text-xl text-gray-800 dark:text-white">
          Student Dashboard
        </h1>
      </div>

      {/* User info + dark mode toggle */}
      <div className="flex items-center gap-4">
        <span className="text-gray-600 dark:text-gray-300">{user?.fullName || user?.email}</span>
        <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full">
          {user?.fullName?.[0] || "S"}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="ml-4 px-3 py-1 rounded-full border border-gray-400 dark:border-gray-300 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>
    </div>
  );
}
