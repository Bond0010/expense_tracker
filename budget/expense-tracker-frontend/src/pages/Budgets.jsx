import { useState, useEffect } from "react";

export default function Budgets() {
  const [budgetType, setBudgetType] = useState("Monthly");
  const [amount, setAmount] = useState("");
  const [savedBudget, setSavedBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextResetDate, setNextResetDate] = useState(null);

  const token = localStorage.getItem("token");

  // ⏳ Helper: calculate reset date on frontend too (for UI display)
  const calculateNextReset = (type, createdAt) => {
    const date = new Date(createdAt);
    switch (type) {
      case "Daily":
        date.setDate(date.getDate() + 1);
        break;
      case "Weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "Monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "Semester":
        date.setMonth(date.getMonth() + 6);
        break;
      default:
        return null;
    }
    return date;
  };

  // ✅ Fetch budget from backend
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/budgets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch budget");
        const data = await res.json();
        if (data) {
          setSavedBudget(data);
          setNextResetDate(calculateNextReset(data.type, data.created_at));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchBudget();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount) return;

    try {
      const res = await fetch("http://localhost:5000/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: budgetType, amount: parseFloat(amount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save budget");

      setSavedBudget(data);
      setNextResetDate(calculateNextReset(data.type, data.created_at));
      setAmount("");
      alert("✅ Budget saved successfully!");
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
    }
  };

  const resetBudget = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/budgets/${savedBudget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete budget");

      setSavedBudget(null);
      setNextResetDate(null);
      alert("✅ Budget reset successfully!");
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!token) {
    return (
      <div className="p-6 text-red-600 font-bold">
        ❌ Unauthorized! Please log in first.
      </div>
    );
  }

  const now = new Date();
  const canReset = nextResetDate && now >= nextResetDate;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Budget Setup</h2>

      {savedBudget ? (
        <div className="bg-green-100 p-4 rounded-lg shadow mb-6">
          <p className="text-lg">
            ✅ Active {savedBudget.type} Budget:{" "}
            <span className="font-bold">
              ₦{savedBudget.amount.toLocaleString()}
            </span>
          </p>

          {nextResetDate && (
            <p className="text-sm text-gray-700 mt-2">
              ⏳ You can reset after:{" "}
              <span className="font-semibold">
                {nextResetDate.toLocaleString()}
              </span>
            </p>
          )}

          <button
            onClick={resetBudget}
            disabled={!canReset}
            className={`mt-3 px-4 py-2 rounded-lg ${
              canReset
                ? "bg-red-600 text-white"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Reset Budget
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="space-y-4 bg-white p-6 rounded-xl shadow w-full max-w-md"
        >
          <select
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Semester</option>
          </select>
          <input
            type="number"
            placeholder="Enter Budget Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Save Budget
          </button>
        </form>
      )}
    </div>
  );
}
