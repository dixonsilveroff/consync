import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Registration handled in controller
router.post("/register", authController.register);

// Login route - using controller
router.post("/login", authController.login);

// Other routes
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
