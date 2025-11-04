import express from "express";
import * as invitationController from "../controllers/invitationController.js";
import authMiddleware from "../middleware/auth.js";
import permit from "../middleware/permit.js";

const router = express.Router();

// Send invitation (contractor only)
router.post(
  "/send",
  authMiddleware,
  permit("contractor"),
  invitationController.sendInvitation
);

// Get invitation by token (public - no auth required)
router.get(
  "/:token",
  invitationController.getInvitation
);

// Accept invitation and create account (public - no auth required)
router.post(
  "/:token/accept",
  invitationController.acceptInvitation
);

// List invitations sent by current user (contractor only)
router.get(
  "/",
  authMiddleware,
  permit("contractor"),
  invitationController.listInvitations
);

// Cancel invitation (contractor only)
router.patch(
  "/:id/cancel",
  authMiddleware,
  permit("contractor"),
  invitationController.cancelInvitation
);

// Resend invitation (contractor only)
router.post(
  "/:id/resend",
  authMiddleware,
  permit("contractor"),
  invitationController.resendInvitation
);

export default router;
