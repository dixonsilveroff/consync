import User from "../models/User.js";
import Organization from "../models/organizationModel.js";
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

// POST /api/users/complete-onboarding
export async function completeOnboarding(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { profile, organization } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only contractors should use onboarding
    if (user.role !== 'contractor') {
      return res.status(403).json({ message: "Onboarding is only for contractors" });
    }

    // Check if already completed
    if (user.onboardingCompleted) {
      return res.status(400).json({ message: "Onboarding already completed" });
    }

    // Update profile fields if provided
    if (profile) {
      if (profile.phone) user.phone = profile.phone;
      if (profile.bio) {
        if (profile.bio.length > 500) {
          return res.status(400).json({ message: "Bio must be 500 characters or less" });
        }
        user.bio = profile.bio;
      }
    }

    // Create or update organization
    if (organization) {
      const { name, industry, location, phone, website } = organization;

      // Validate required organization fields
      if (!name || !industry || !location) {
        return res.status(400).json({ 
          message: "Organization name, industry, and location are required" 
        });
      }

      // Check if user already has an organization
      if (user.organization) {
        // Update existing organization
        const org = await Organization.findById(user.organization);
        if (org) {
          org.name = name;
          org.industry = industry;
          org.location = location;
          if (phone) org.phone = phone;
          if (website) org.website = website;
          await org.save();
        }
      } else {
        // Create new organization
        const newOrg = await Organization.create({
          name,
          industry,
          location,
          phone: phone || undefined,
          website: website || undefined,
          owner: userId,
          members: [userId],
          active: true,
        });

        user.organization = newOrg._id;
      }
    }

    // Mark onboarding as completed
    user.onboardingCompleted = true;
    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(userId)
      .select("-passwordHash -refreshTokenHash")
      .populate('organization');

    return res.json({ 
      message: "Onboarding completed successfully", 
      user: updatedUser 
    });
  } catch (err) {
    next(err);
  }
}

export default { getProfile, updateProfile, changePassword, completeOnboarding };
