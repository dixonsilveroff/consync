import express from "express";
import authMiddleware from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import userController from "../controllers/userController.js";

const router = express.Router();

// Get current user's profile
router.get("/profile", authMiddleware, userController.getProfile);

// Update current user's profile
router.put("/profile", authMiddleware, userController.updateProfile);

// Example admin-only route
router.get("/admin/data", authMiddleware, authorizeRoles("admin"), (req, res) => {
  res.json({ secret: "admin only data" });
});

// Change password (requires current password)
router.post("/change-password", authMiddleware, userController.changePassword);

export default router;
