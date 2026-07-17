import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Income from "./pages/Income";
import Settings from "./pages/Settings";
import AiAssistant from "./components/AiAssistant";
import './index.css';
import Home from "./pages/Home";

function Layout({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex">
      {/* Sidebar handles its own responsiveness */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 bg-gray-100 dark:bg-gray-800 transition-colors">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="/incomes" element={<Layout><Income /></Layout>} />
        <Route path="/budgets" element={<Layout><Budgets /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Routes>

      {/* Global AI assistant */}
      <AiAssistant />
    </BrowserRouter>
  );
}
