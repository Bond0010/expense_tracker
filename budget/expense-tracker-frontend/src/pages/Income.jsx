import { useState, useEffect } from "react";

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    title: "",
    amount: "",
    recurring: false,
    date: "",
  });
  // ✅ Parse the stored "user" object
const user = JSON.parse(localStorage.getItem("user"));
const token = user?.token;


  // 🔔 Log notifications
  const logNotification = (message) => {
    const stored = JSON.parse(localStorage.getItem("notifications")) || [];
    const newNote = { id: Date.now(), message, date: new Date().toLocaleString() };
    localStorage.setItem("notifications", JSON.stringify([newNote, ...stored]));
  };

  // 🔊 Text-to-Speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Fetch incomes from backend
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        if (!token) return; // 🚫 block if no token
        const res = await fetch("http://localhost:5000/api/incomes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch incomes");
        const data = await res.json();
        setIncomes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching incomes:", err);
      }
    };
    fetchIncomes();
  }, [token]);

  // Add new income
  const addIncome = async () => {
    if (!newIncome.title || !newIncome.amount) {
      alert("⚠️ Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/incomes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 Secure API call
        },
        body: JSON.stringify({
          ...newIncome,
          amount: parseFloat(newIncome.amount),
        }),
      });

      if (!res.ok) throw new Error("Failed to save income");

      const savedIncome = await res.json();
      setIncomes([savedIncome, ...incomes]);
      setIsModalOpen(false);

      const msg = `💰 Income added: ${savedIncome.title} - ₦${savedIncome.amount}`;
      speak(msg);
      logNotification(msg);

      // reset form
      setNewIncome({ title: "", amount: "", recurring: false, date: "" });
    } catch (err) {
      console.error("Error adding income:", err);
      alert("Failed to add income. Check server.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Income Records</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Income
        </button>
      </div>

      {incomes.length === 0 ? (
        <p className="text-gray-500">No income records yet.</p>
      ) : (
        <ul className="space-y-4">
          {incomes.map((inc) => (
            <li
              key={inc.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{inc.title}</p>
                <p className="text-sm text-gray-500">
                  ₦{(inc.amount ?? 0).toLocaleString()}{" "}
                  {inc.recurring ? "(Recurring)" : ""}
                </p>
                <p className="text-xs text-gray-400">
                  {inc.date
                    ? new Date(inc.date).toLocaleDateString("en-GB")
                    : new Date().toLocaleDateString("en-GB")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Add Income</h3>
            <input
              type="text"
              placeholder="Income Title"
              value={newIncome.title}
              onChange={(e) =>
                setNewIncome({ ...newIncome, title: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Amount (₦)"
              value={newIncome.amount}
              onChange={(e) =>
                setNewIncome({ ...newIncome, amount: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded-lg"
            />
            <input
              type="date"
              value={newIncome.date}
              onChange={(e) =>
                setNewIncome({ ...newIncome, date: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded-lg"
            />
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={newIncome.recurring}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, recurring: e.target.checked })
                }
              />
              <span>Recurring Income</span>
            </label>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addIncome}
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
