import { db } from "../db.js";

// ✅ GET all expenses for logged-in user
export const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from token
    const [rows] = await db.query(
      "SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching expenses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET total expenses for logged-in user
export const getTotalExpenses = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from token
    const [rows] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = ?",
      [userId]
    );
    res.json({ total: rows[0].total });
  } catch (err) {
    console.error("❌ Error fetching total expenses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREATE new expense (with balance check)
export const createExpense = async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || !amount || !date) {
    return res
      .status(400)
      .json({ message: "Title, amount, and date are required" });
  }

  try {
    const userId = req.user.id; // extracted from token

    // 🔹 Get the latest budget for this user
    const [budgetRows] = await db.query(
      "SELECT * FROM budgets WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );

    if (budgetRows.length === 0) {
      return res.status(400).json({ message: "No budget set yet" });
    }

    const currentBudget = budgetRows[0].amount;

    // 🔹 Get total spent already
    const [spentRows] = await db.query(
      "SELECT COALESCE(SUM(amount),0) AS total_spent FROM expenses WHERE user_id = ?",
      [userId]
    );

    const totalSpent = spentRows[0].total_spent;
    const remainingBalance = currentBudget - totalSpent;

    // 🔹 Check if user has enough balance
    if (amount > remainingBalance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 🔹 Insert new expense
    const [result] = await db.query(
      "INSERT INTO expenses (title, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)",
      [title, amount, category || "General", date, userId]
    );

    // 🔹 Fetch the newly created expense
    const [newExpense] = await db.query(
      "SELECT * FROM expenses WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newExpense[0]);
  } catch (err) {
    console.error("❌ Error creating expense:", err);
    res.status(500).json({ message: "Server error" });
  }
};
