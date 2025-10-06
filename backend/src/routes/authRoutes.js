import express from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh); // reads httpOnly cookie
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

export default router;
