import User from "../models/User.js";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "consync_rt";

// GET /api/users/profile
export async function getProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId).select("-passwordHash -refreshTokenHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/profile
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { name, phone, bio } = req.body;

    // Only allow updating non-sensitive fields here
    const updates = {};
    if (typeof name === "string") updates.name = name;
    if (typeof phone === "string") updates.phone = phone;
    if (typeof bio === "string") {
      if (bio.length > 500) {
        return res.status(400).json({ message: "Bio must be 500 characters or less" });
      }
      updates.bio = bio;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select(
      "-passwordHash -refreshTokenHash"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user, message: "Profile updated" });
  } catch (err) {
    next(err);
  }
}

// PUT/POST /api/users/change-password
export async function changePassword(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "currentPassword and newPassword are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    // Invalidate existing refresh tokens (force re-login everywhere)
    user.refreshTokenHash = null;
    await user.save();

    // Clear refresh cookie on client
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "strict", secure: process.env.COOKIE_SECURE === "true" });

    return res.json({ message: "Password changed successfully. Please log in again." });
  } catch (err) {
    next(err);
  }
}
export default { getProfile, updateProfile, changePassword };
