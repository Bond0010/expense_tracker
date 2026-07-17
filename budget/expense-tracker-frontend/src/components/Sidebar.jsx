import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const linkClass =
    "block py-2 px-4 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 transition";

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-md">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-full" />
          <span className="font-bold text-lg text-gray-800 dark:text-white">
            Expense Tracker
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Dark Mode Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-gray-800 dark:text-white focus:outline-none"
          >
            {darkMode ? (
              // Sun icon for light mode
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m8.66-13.66l-.7.7M4.34 19.66l-.7.7M21 12h1M2 12H1m16.95 4.95l-.7.7M6.75 6.75l-.7.7M12 5a7 7 0 100 14 7 7 0 000-14z"
                />
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                />
              </svg>
            )}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-800 dark:text-white focus:outline-none"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-full bg-white dark:bg-gray-900 shadow-md transform transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-2 p-4 text-xl font-bold border-b text-gray-800 dark:text-white">
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-full" />
          <span>Expense Tracker</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/dashboard" className={linkClass} onClick={() => setIsOpen(false)}>Dashboard</NavLink>
          <NavLink to="/expenses" className={linkClass} onClick={() => setIsOpen(false)}>Expenses</NavLink>
          <NavLink to="/incomes" className={linkClass} onClick={() => setIsOpen(false)}>Incomes</NavLink>
          <NavLink to="/budgets" className={linkClass} onClick={() => setIsOpen(false)}>Budgets</NavLink>
          <NavLink to="/reports" className={linkClass} onClick={() => setIsOpen(false)}>Reports</NavLink>
          <NavLink to="/notifications" className={linkClass} onClick={() => setIsOpen(false)}>Notifications</NavLink>
          <NavLink to="/settings" className={linkClass} onClick={() => setIsOpen(false)}>Settings</NavLink>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="m-4 bg-red-500 text-white py-2 rounded-lg w-[calc(100%-2rem)]"
        >
          Logout
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        ></div>
      )}
    </>
  );
}
