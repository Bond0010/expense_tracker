import { db } from "../db.js";

// ✅ GET all incomes for logged-in user
export const getIncomes = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from token
    const [rows] = await db.query(
      "SELECT * FROM incomes WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching incomes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREATE new income
export const createIncome = async (req, res) => {
  const { title, amount, recurring, date } = req.body;

  if (!title || !amount || !date) {
    return res.status(400).json({ message: "Title, amount, and date are required" });
  }

  try {
    const userId = req.user.id; // extracted from token

    const [result] = await db.query(
      "INSERT INTO incomes (title, amount, recurring, date, user_id) VALUES (?, ?, ?, ?, ?)",
      [title, amount, recurring ? 1 : 0, date, userId]
    );

    const [newIncome] = await db.query(
      "SELECT * FROM incomes WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newIncome[0]);
  } catch (err) {
    console.error("❌ Error creating income:", err);
    res.status(500).json({ message: "Server error" });
  }
};
