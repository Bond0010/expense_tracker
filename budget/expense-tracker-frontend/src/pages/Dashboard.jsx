import { useEffect, useState } from "react";
import CardStat from "../components/CardStat";
import { useNavigate } from "react-router-dom";
import AiAssistant from "../components/AiAssistant";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  // ✅ Get token from localStorage
  const token = localStorage.getItem("token");

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-NG";
    window.speechSynthesis.speak(utterance);
  };

  const logNotification = (message) => {
    const stored = JSON.parse(localStorage.getItem("notifications")) || [];
    const newNote = { id: Date.now(), message, date: new Date().toLocaleString() };
    localStorage.setItem("notifications", JSON.stringify([newNote, ...stored]));
  };

  // Fetch incomes and expenses from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeRes = await fetch("http://localhost:5000/api/incomes", {
          headers: {
            "Authorization": `Bearer ${token}`,  // ✅ attach token
          },
        });
        const expenseRes = await fetch("http://localhost:5000/api/expenses", {
          headers: {
            "Authorization": `Bearer ${token}`,  // ✅ attach token
          },
        });

        if (!incomeRes.ok || !expenseRes.ok) throw new Error("Failed to fetch data");

        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();

        setIncomes(Array.isArray(incomeData) ? incomeData : []);
        setExpenses(Array.isArray(expenseData) ? expenseData : []);

        const totalIncome = incomeData.reduce((sum, i) => sum + Number(i.amount), 0);
        const totalExpense = expenseData.reduce((sum, e) => sum + Number(e.amount), 0);
        setBalance(totalIncome - totalExpense);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    if (token) fetchData();
  }, [token]);

  // ✅ Block unauthorized users
  if (!token) {
    return (
      <div className="p-6 text-red-600 font-bold">
        ❌ Unauthorized! Please log in first.
      </div>
    );
  }

  // ================= DATE HELPERS =================
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ Filter using created_at
  const todaysSpending = expenses
    .filter((e) => {
      const created = new Date(e.created_at);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const thisWeekSpending = expenses
    .filter((e) => new Date(e.created_at) >= getStartOfWeek(today))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const thisMonthSpending = expenses
    .filter((e) => new Date(e.created_at) >= getStartOfMonth(today))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const thisSemesterSpending = expenses
    .filter((e) => new Date(e.created_at) >= getStartOfSemester(today))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  // ================= QUICK PAYMENT =================
  const addExpense = async (title, category, amount) => {
    if (balance < amount) {
      const msg = "❌ Insufficient balance to complete this payment.";
      alert(msg);
      speak(msg);
      logNotification(msg);
      return;
    }

    try {
      const newExpense = {
        title,
        category,
        amount,
        date: new Date().toISOString(),
      };

      const res = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // ✅ attach token
        },
        body: JSON.stringify(newExpense),
      });

      if (!res.ok) throw new Error("Failed to add expense");

      const savedExpense = await res.json();
      setExpenses([savedExpense, ...expenses]);
      setBalance(balance - Number(savedExpense.amount));

      const msg = `✅ ${title} of ₦${Number(savedExpense.amount).toLocaleString()} paid successfully. Remaining balance ₦${(balance - savedExpense.amount).toLocaleString()}`;
      alert(msg);
      speak(msg);
      logNotification(msg);
    } catch (err) {
      console.error("Error adding quick payment:", err);
      alert("Failed to add expense. Check server.");
    }
  };

  // ================= CHART =================
  const chartData = [
    { name: "Income", value: totalIncome },
    { name: "Expenses", value: expenses.reduce((sum, e) => sum + Number(e.amount), 0) },
  ];
  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Balance */}
      <div className="bg-white shadow rounded-xl p-6 mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">Available Balance</p>
          <h3 className="text-3xl font-bold">₦{balance.toLocaleString()}</h3>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/incomes")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Money
          </button>
          <button
            onClick={() => navigate("/expenses")}
            disabled={balance <= 0}
            className={`px-4 py-2 rounded-lg ${
              balance <= 0 ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 text-white"
            }`}
          >
            - Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <CardStat title="Today’s Spending" amount={`₦${todaysSpending.toLocaleString()}`} />
        <CardStat title="This Week" amount={`₦${thisWeekSpending.toLocaleString()}`} />
        <CardStat title="This Month" amount={`₦${thisMonthSpending.toLocaleString()}`} />
        <CardStat title="This Semester" amount={`₦${thisSemesterSpending.toLocaleString()}`} />
        <CardStat title="Total Income" amount={`₦${totalIncome.toLocaleString()}`} />
      </div>

      {/* Quick Shortcuts */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Quick Payments</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => addExpense("SUG Dues", "School Fees", 5000)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Pay SUG Dues (₦5,000)
          </button>
          <button
            onClick={() => addExpense("Department Dues (CSIT)", "Department", 3000)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Pay Department Dues (₦3,000)
          </button>
          <button
            onClick={() => addExpense("Tribal Dues", "Association", 2000)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
          >
            Pay Tribal Dues (₦2,000)
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <AiAssistant />
    </div>
  );
}
