import express from "express";
import authMiddleware from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import userController from "../controllers/userController.js";

const router = express.Router();

// Get current user's profile
router.get("/profile", authMiddleware, userController.getProfile);

// Update current user's profile
router.put("/profile", authMiddleware, userController.updateProfile);

// Example contractor-only route (contractor is the admin role)
router.get("/admin/data", authMiddleware, authorizeRoles("contractor"), (req, res) => {
  res.json({ secret: "contractor only data" });
});

// Change password (requires current password)
router.post("/change-password", authMiddleware, userController.changePassword);

// Complete onboarding (contractors only)
router.post("/complete-onboarding", authMiddleware, userController.completeOnboarding);

export default router;
