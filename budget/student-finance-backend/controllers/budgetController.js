import { db } from "../db.js";

// Helper: calculate next reset date
function getNextResetDate(type, createdAt) {
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
}

// ✅ GET latest budget for logged-in user
export const getBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT * FROM budgets WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error("❌ Error fetching budget:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREATE new budget (with time-lock)
export const createBudget = async (req, res) => {
  const { type, amount } = req.body;

  if (!type || !amount) {
    return res.status(400).json({ message: "Type and amount required" });
  }

  try {
    const userId = req.user.id;

    // 1. Check if a budget already exists
    const [existing] = await db.query(
      "SELECT * FROM budgets WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );

    if (existing.length > 0) {
      const lastBudget = existing[0];
      const nextResetDate = getNextResetDate(lastBudget.type, lastBudget.created_at);
      const now = new Date();

      if (nextResetDate && now < nextResetDate) {
        return res.status(400).json({
          message: `❌ You cannot reset your ${lastBudget.type} budget until ${nextResetDate.toLocaleString()}`,
        });
      }
    }

    // 2. Insert new budget
    const [result] = await db.query(
      "INSERT INTO budgets (type, amount, user_id, created_at) VALUES (?, ?, ?, NOW())",
      [type, amount, userId]
    );

    const [newBudget] = await db.query("SELECT * FROM budgets WHERE id = ?", [result.insertId]);
    res.status(201).json(newBudget[0]);
  } catch (err) {
    console.error("❌ Error creating budget:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE budget by ID (with time-lock)
export const deleteBudget = async (req, res) => {
  const { id } = req.params;

  try {
    const userId = req.user.id;

    // 1. Fetch budget first
    const [budgets] = await db.query("SELECT * FROM budgets WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    if (budgets.length === 0) {
      return res.status(404).json({ message: "Budget not found or not authorized" });
    }

    const budget = budgets[0];
    const nextResetDate = getNextResetDate(budget.type, budget.created_at);
    const now = new Date();

    if (nextResetDate && now < nextResetDate) {
      return res.status(400).json({
        message: `❌ You cannot reset your ${budget.type} budget until ${nextResetDate.toLocaleString()}`,
      });
    }

    // 2. Delete if allowed
    await db.query("DELETE FROM budgets WHERE id = ? AND user_id = ?", [id, userId]);

    res.json({ message: "✅ Budget deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting budget:", err);
    res.status(500).json({ message: "Server error" });
  }
};
