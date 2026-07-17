import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import incomesRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { verifyToken } from "./middleware/authMiddleware.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // login & register are public
app.use("/api/incomes", verifyToken, incomesRoutes);
app.use("/api/expenses", verifyToken, expenseRoutes);
app.use("/api/budgets", verifyToken, budgetRoutes);
app.use("/api/users", verifyToken, userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
