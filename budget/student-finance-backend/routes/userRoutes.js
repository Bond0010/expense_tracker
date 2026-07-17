import express from "express";
import { getProfile, updateProfile, changePassword, getBalance } from "../controllers/userController.js";
import upload from "../middleware/uploadMiddleware.js"; // multer for images
import { verifyToken } from "../middleware/authMiddleware.js"; // make sure this exists

const router = express.Router();

router.get("/:id", verifyToken,  getProfile); // GET user profile
router.put("/:id", verifyToken, upload.single("avatar"), updateProfile); // UPDATE profile (with image)
router.put("/:id/change-password", verifyToken, changePassword); // UPDATE password
router.get("/balance", verifyToken, getBalance); // ✅ NEW ROUTE

export default router;
 