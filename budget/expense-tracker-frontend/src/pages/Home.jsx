import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";
import preview from "../assets/preview.png";
import budget3 from "../assets/budget3.jpg";

const sliderItems = [
  {
    title: "Track Expenses",
    description: "Effortlessly monitor your spending with real-time updates.",
    icon: "💸",
  },
  {
    title: "Manage Budgets",
    description: "Set and track budgets to stay in control of your finances.",
    icon: "📊",
  },
  {
    title: "Stay Notified",
    description: "Get alerts to keep your spending habits in check.",
    icon: "🔔",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-300 font-sans">

        {/* Hero Section */}
        <header
          className="relative text-white text-center pt-20 pb-16 px-6 bg-cover bg-center"
          style={{ backgroundImage: `url(${budget3})` }}
        >
          <div className="absolute inset-0 bg-black/40 dark:bg-gray-900/60"></div>
          <img 
            src={logo} 
            alt="Expense Tracker Logo" 
            className="absolute top-6 left-6 w-12 h-12 rounded-full shadow-lg border-2 border-white/30 z-10" 
          />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-6 right-6 bg-white/10 dark:bg-gray-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-white/20 dark:hover:bg-gray-600 z-10 transition-all duration-300"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
              Expense Tracker
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90 drop-shadow-md">
              Your all-in-one solution for managing expenses, budgets, and financial insights.
            </p>

            {/* Slider */}
            <div className="relative max-w-3xl mx-auto h-44 md:h-40">
              {sliderItems.map((item, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-4 transition-all duration-1000 ease-in-out transform ${
                    index === currentSlide
                      ? "opacity-100 translate-x-0 z-10"
                      : "opacity-0 -translate-x-10 z-0"
                  }`}
                >
                  <span className="text-5xl">{item.icon}</span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold">{item.title}</h2>
                    <p className="text-lg md:text-xl opacity-80">{item.description}</p>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {sliderItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-white scale-125" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Hero Buttons */}
            <div className="flex justify-center gap-4 mt-12 flex-wrap">
              <button
                onClick={() => navigate("/register")}
                className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-indigo-50 transition-all duration-300"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300"
              >
                Log In
              </button>
            </div>
          </div>
        </header>

        {/* About Section */}
        <section className="bg-white dark:bg-gray-800 py-16 px-6 shadow-inner">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Why Choose Expense Tracker?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              Take control of your finances with a user-friendly platform designed to simplify expense tracking, budgeting, and reporting.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Easy Setup</h3>
                <p className="text-gray-600 dark:text-gray-300">Register and start tracking your expenses in minutes.</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Real-Time Insights</h3>
                <p className="text-gray-600 dark:text-gray-300">Monitor spending and budgets with live updates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Preview Section */}
<section className="bg-indigo-50 dark:bg-gray-700 py-16 px-6">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
    
    {/* Rotated Mobile Preview */}
    <div className="relative w-64 md:w-80 flex-shrink-0">
      <div className="border-8 border-gray-800 dark:border-gray-200 rounded-3xl shadow-2xl overflow-hidden transform -rotate-6 hover:rotate-0 transition-transform duration-500">
        <img
          src={preview}
          alt="Mobile dashboard preview"
          className="w-full h-auto object-cover"
        />
      </div>
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-800 dark:bg-gray-200 rounded-full"></div>
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800 dark:bg-gray-200 rounded-full shadow-inner"></div>
    </div>

    {/* Text Content */}
    <div className="text-center md:text-left max-w-xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
        Mobile-Friendly Design
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
        Manage your finances anywhere, anytime, with a seamless mobile experience. 
        Check reports, add expenses, and stay notified on the go.
      </p>
      <button
        onClick={() => navigate("/register")}
        className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-indigo-50 transition-all duration-300"
      >
        Get Started
      </button>
    </div>

  </div>
</section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-950 text-white text-center py-8 border-t border-white/20">
          <p className="text-sm">Developed by Mr. Christian (Nacos), Vice President at PTI</p>
        </footer>
      </div>
    </div>
  );
}
