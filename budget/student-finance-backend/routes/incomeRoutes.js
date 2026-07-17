import express from "express";
import { getIncomes, createIncome } from "../controllers/incomeController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // make sure this exists

const router = express.Router();

// Protect routes
router.get("/", verifyToken, getIncomes);
router.post("/", verifyToken,  createIncome);

export default router;
