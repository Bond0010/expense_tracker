import express from "express";
import { createExpense, getExpenses, getTotalExpenses } from "../controllers/expensesController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // make sure this exists

const router = express.Router();

// Protect routes
router.get("/", verifyToken, getExpenses);
router.post("/",verifyToken,  createExpense);
router.get("/total",verifyToken,  getTotalExpenses);

export default router;
