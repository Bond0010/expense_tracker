import { db } from "../db.js";
import bcrypt from "bcryptjs";

// ✅ Get logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT

    const [rows] = await db.query(
      "SELECT id, full_name, email, avatar, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update profile (name, email, avatar)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, email } = req.body;
    const avatar = req.file ? req.file.filename : null;

    const query = avatar
      ? "UPDATE users SET full_name = ?, email = ?, avatar = ? WHERE id = ?"
      : "UPDATE users SET full_name = ?, email = ? WHERE id = ?";

    const params = avatar
      ? [full_name, email, avatar, userId]
      : [full_name, email, userId];

    await db.query(query, params);

    res.json({ message: "✅ Profile updated successfully" });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Change password (with hashing)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const [rows] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    console.error("❌ Error changing password:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get user's available balance (budget - expenses)
export const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get latest budget
    const [budgetRows] = await db.query(
      "SELECT amount FROM budgets WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );

    const budget = budgetRows.length > 0 ? Number(budgetRows[0].amount) : 0;

    // 2. Get total expenses
    const [spentRows] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalSpent FROM expenses WHERE user_id = ?",
      [userId]
    );

    const spent = Number(spentRows[0].totalSpent) || 0;

    // 3. Calculate balance
    const balance = budget - spent;

    // ✅ Always return all three values
    res.json({
      budget,
      spent,
      balance,
    });
  } catch (err) {
    console.error("❌ Error fetching balance:", err);
    res.status(500).json({ message: "Server error" });
  }
};
