import express from "express";
import { getBudget, createBudget, deleteBudget } from "../controllers/budgetController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getBudget);          // Get latest budget
router.post("/", verifyToken, createBudget);      // Create new budget
router.delete("/:id", verifyToken, deleteBudget); // Delete budget by ID

export default router;
