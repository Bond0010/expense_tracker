import { useState, useEffect, useRef } from "react";
import ExpenseForm from "../components/ExpenseForm";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budget, setBudget] = useState(null);
  const [spent, setSpent] = useState(0);
  const [balance, setBalance] = useState(0);
  const token = localStorage.getItem("token");

  // ✅ Prevent duplicate voice alerts
  const lastSpokenLevel = useRef(null);

  // 🔔 Notifications
  const logNotification = (message) => {
    const stored = JSON.parse(localStorage.getItem("notifications")) || [];
    const newNote = { id: Date.now(), message, date: new Date().toLocaleString() };
    localStorage.setItem("notifications", JSON.stringify([newNote, ...stored]));
  };

  // 🔊 Text-to-Speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // ✅ Fetch budget
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/budgets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBudget(data || null);
      } catch (err) {
        console.error("Error fetching budget:", err);
      }
    };
    fetchBudget();
  }, [token]);

  // ✅ Fetch incomes
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/incomes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIncomes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching incomes:", err);
      }
    };
    fetchIncomes();
  }, [token]);

  // ✅ Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };
    fetchExpenses();
  }, [token]);

  // ✅ Calculate balance from incomes - expenses
  useEffect(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    setBalance(totalIncome - totalExpense);
    setSpent(totalExpense);
  }, [incomes, expenses]);

  // ✅ Voice alerts for budget usage
  useEffect(() => {
    if (!budget) return;
    const percent = (spent / Number(budget.amount)) * 100;
    let level = null;

    if (percent >= 100) level = "100";
    else if (percent >= 90) level = "90";
    else if (percent >= 80) level = "80";
    else if (percent >= 70) level = "70";

    if (level && lastSpokenLevel.current !== level) {
      let msg =
        level === "100"
          ? `You have exceeded your budget for this ${budget.type}.`
          : `You have used ${level} percent of your budget for this ${budget.type}.`;

      speak(msg);
      logNotification(msg);
      lastSpokenLevel.current = level; // prevent repeating same level
    }
  }, [spent, budget]);

  // ✅ Add expense
  const addExpense = async (newExpense) => {
    if (!budget) {
      alert("❌ Please set a budget before adding expenses.");
      return;
    }

    const expenseAmount = Number(newExpense.amount);

    // 🚨 Budget check
    if (spent + expenseAmount > Number(budget.amount)) {
      const msg = "❌ Budget limit reached. You cannot add more expenses.";
      alert(msg);
      logNotification(msg);
      speak(msg);
      return;
    }

    // 🚨 Balance check
    if (expenseAmount > balance) {
      const msg = "❌ Insufficient balance. You cannot spend more than your income.";
      alert(msg);
      logNotification(msg);
      speak(msg);
      return;
    }

    // ✅ Save expense
    try {
      const res = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newExpense, amount: expenseAmount }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to save expense");
        return;
      }

      const savedExpense = await res.json();
      setExpenses([savedExpense, ...expenses]);
      setIsModalOpen(false);

      const msg = `✅ Expense added: ${savedExpense.title} - ₦${savedExpense.amount}`;
      speak(msg);
      logNotification(msg);
    } catch (err) {
      console.error("Error adding expense:", err);
      alert("Failed to add expense. Check server.");
    }
  };

  const percentSpent = budget
    ? Math.min((spent / Number(budget.amount)) * 100, 100)
    : 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!budget || spent >= Number(budget.amount)}
          className={`px-4 py-2 rounded-lg text-white ${
            !budget
              ? "bg-gray-400 cursor-not-allowed"
              : spent >= Number(budget.amount)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600"
          }`}
        >
          + Add Expense
        </button>
      </div>

      {/* If no budget */}
      {!budget && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
          ⚠️ Please set a budget before adding expenses.
        </div>
      )}

      {/* Budget & Balance */}
      {budget && (
        <div className="mb-6">
          <p className="mb-2 font-medium">
            {budget.type} Budget: ₦{Number(budget.amount).toLocaleString()} | Spent: ₦
            {spent.toLocaleString()} | Balance: ₦{balance.toLocaleString()}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${
                percentSpent < 70
                  ? "bg-green-500"
                  : percentSpent < 100
                  ? "bg-yellow-500"
                  : "bg-red-600"
              }`}
              style={{ width: `${percentSpent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      {budget && (
        <div className="bg-white shadow rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount (₦)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="border-t">
                  <td className="p-3">
                    {new Date(exp.created_at).toLocaleString("en-GB", {
                      hour12: false,
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="p-3">{exp.title}</td>
                  <td className="p-3">{exp.category}</td>
                  <td className="p-3 font-bold">
                    ₦{Number(exp.amount ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ExpenseForm onClose={() => setIsModalOpen(false)} onSave={addExpense} />
      )}
    </div>
  );
}
