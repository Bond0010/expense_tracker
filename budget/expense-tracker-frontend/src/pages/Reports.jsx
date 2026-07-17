import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [filter, setFilter] = useState("today"); // today, week, month, semester
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000/api";

  // 🔑 Get token from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    if (!token) {
      // If no token, redirect to login
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [expRes, incRes] = await Promise.all([
          fetch(`${API_BASE}/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/incomes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (expRes.status === 401 || incRes.status === 401) {
          // Unauthorized → Token expired or invalid
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!expRes.ok || !incRes.ok) throw new Error("Failed to fetch data");

        const expData = await expRes.json();
        const incData = await incRes.json();

        setExpenses(expData.map(e => ({ ...e, amount: Number(e.amount || 0) })));
        setIncome(incData.map(i => ({ ...i, amount: Number(i.amount || 0) })));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [token, navigate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset hours

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getStartOfMonth = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getStartOfSemester = (date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const start = month <= 6 ? new Date(year, 0, 1) : new Date(year, 6, 1);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // Filter expenses based on selected filter
  const filteredExpenses = useMemo(() => {
    switch (filter) {
      case "today":
        return expenses.filter((e) => {
          const created = new Date(e.created_at);
          created.setHours(0, 0, 0, 0);
          return created.getTime() === today.getTime();
        });
      case "week":
        return expenses.filter((e) => new Date(e.created_at) >= getStartOfWeek(today));
      case "month":
        return expenses.filter((e) => new Date(e.created_at) >= getStartOfMonth(today));
      case "semester":
        return expenses.filter((e) => new Date(e.created_at) >= getStartOfSemester(today));
      default:
        return expenses;
    }
  }, [expenses, filter, today]);

  // Totals
  const totalIncome = useMemo(() => income.reduce((sum, i) => sum + Number(i.amount), 0), [income]);
  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0), [filteredExpenses]);
  const balance = totalIncome - totalExpenses;

  // Pie chart data (expenses by category)
  const categoryData = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => {
      const existing = acc.find(c => c.name === e.category);
      if (existing) existing.value += e.amount;
      else acc.push({ name: e.category, value: e.amount });
      return acc;
    }, []);
  }, [filteredExpenses]);

  // Bar chart data (expenses by date)
  const dateData = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => {
      const existing = acc.find(d => d.date === e.created_at.split("T")[0]);
      if (existing) existing.amount += e.amount;
      else acc.push({ date: e.created_at.split("T")[0], amount: e.amount });
      return acc;
    }, []);
  }, [filteredExpenses]);

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#AA46BE", "#FF5C8D"];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Reports</h2>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {["today", "week", "month", "semester"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-green-100 p-6 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold">Total Income</h3>
          <p className="text-2xl font-bold text-green-700">₦{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-red-100 p-6 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-700">₦{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-blue-100 p-6 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold">Balance</h3>
          <p className="text-2xl font-bold text-blue-700">₦{balance.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <PieChart width={350} height={300}>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ReTooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Expenses Over Time</h3>
          <BarChart width={400} height={300} data={dateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ReTooltip />
            <Legend />
            <Bar dataKey="amount" fill="#0088FE" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
