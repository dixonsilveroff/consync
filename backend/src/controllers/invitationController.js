import Invitation from "../models/invitationModel.js";
import Organization from "../models/organizationModel.js";
import User from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";

// Send invitation to a new user
export async function sendInvitation(req, res) {
  try {
    const { email, role, projectId, message } = req.body;
    const inviterId = req.user.id;

    // Validate required fields
    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // Only contractors can send invitations
    if (req.user.role !== 'contractor') {
      return res.status(403).json({ message: "Only contractors can send invitations" });
    }

    // Validate role (only engineers and clients can be invited - contractors and suppliers self-register)
    const allowedRoles = ['engineer', 'client'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}. Contractors and suppliers must self-register.` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Get contractor's organization (or create one if doesn't exist)
    let organization = await Organization.findOne({ owner: inviterId });
    if (!organization) {
      // Auto-create organization for contractor
      const contractor = await User.findById(inviterId);
      organization = new Organization({
        name: `${contractor.name}'s Organization`,
        owner: inviterId,
        members: [inviterId],
      });
      await organization.save();

      // Update contractor's organization field
      contractor.organization = organization._id;
      await contractor.save();
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({ 
      email, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });
    
    if (existingInvitation) {
      return res.status(409).json({ 
        message: "An active invitation for this email already exists",
        invitationId: existingInvitation._id
      });
    }

    // Create invitation
    const token = Invitation.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invitation = new Invitation({
      email,
      role,
      token,
      organization: organization._id,
      invitedBy: inviterId,
      projectId: projectId || undefined,
      expiresAt,
      message: message || undefined,
    });

    await invitation.save();

    // TODO: Send email with invitation link
    // For now, return the token in response
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${token}`;

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        inviteLink, // In production, this would be sent via email
      }
    });

  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ message: "Failed to send invitation" });
  }
}

// Get invitation by token (for accept invitation page)
export async function getInvitation(req, res) {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token })
      .populate('invitedBy', 'name email')
      .populate('organization', 'name description')
      .populate('projectId', 'title description');

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (!invitation.isValid()) {
      return res.status(410).json({ 
        message: invitation.status === 'expired' ? "Invitation has expired" : "Invitation is no longer valid",
        status: invitation.status
      });
    }

    res.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        organization: invitation.organization,
        invitedBy: invitation.invitedBy,
        project: invitation.projectId,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
      }
    });

  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ message: "Failed to retrieve invitation" });
  }
}

// Accept invitation and create account
export async function acceptInvitation(req, res) {
  try {
    const { token } = req.params;
    const { name, password, phone } = req.body;

    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Find invitation
    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (!invitation.isValid()) {
      return res.status(410).json({ 
        message: invitation.status === 'expired' ? "Invitation has expired" : "Invitation is no longer valid"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Create user account
    const passwordHash = await User.hashPassword(password);
    const user = new User({
      name,
      email: invitation.email,
      passwordHash,
      phone: phone || undefined,
      role: invitation.role, // Use role from invitation
      organization: invitation.organization,
      invitedBy: invitation.invitedBy,
      verified: true, // Invited users are pre-verified
      onboardingCompleted: false, // Still need onboarding
    });

    await user.save();

    // Add user to organization members
    await Organization.findByIdAndUpdate(
      invitation.organization,
      { $addToSet: { members: user._id } }
    );

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Generate access token and auto-login
    const accessToken = signAccessToken({ id: user._id, role: user.role });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: "Failed to accept invitation" });
  }
}

// List invitations sent by contractor
export async function listInvitations(req, res) {
  try {
    const inviterId = req.user.id;
    const { status } = req.query; // Optional filter by status

    const query = { invitedBy: inviterId };
    if (status) {
      query.status = status;
    }

    const invitations = await Invitation.find(query)
      .populate('organization', 'name')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      invitations: invitations.map(inv => ({
        id: inv._id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        organization: inv.organization,
        project: inv.projectId,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        acceptedAt: inv.acceptedAt,
      }))
    });

  } catch (error) {
    console.error('List invitations error:', error);
    res.status(500).json({ message: "Failed to list invitations" });
  }
}

// Cancel invitation (contractor only)
export async function cancelInvitation(req, res) {
  try {
    const { id } = req.params;
    const inviterId = req.user.id;

    const invitation = await Invitation.findOne({ _id: id, invitedBy: inviterId });
    
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: "Can only cancel pending invitations" });
    }

    invitation.status = 'cancelled';
    await invitation.save();

    res.json({ message: "Invitation cancelled successfully" });

  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({ message: "Failed to cancel invitation" });
  }
}

// Resend invitation (generates new token and extends expiry)
export async function resendInvitation(req, res) {
  try {
    const { id } = req.params;
    const inviterId = req.user.id;

    const invitation = await Invitation.findOne({ _id: id, invitedBy: inviterId });
    
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: "Can only resend pending invitations" });
    }

    // Generate new token and extend expiry
    invitation.token = Invitation.generateToken();
    invitation.expiresAt = new Date();
    invitation.expiresAt.setDate(invitation.expiresAt.getDate() + 7);
    await invitation.save();

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${invitation.token}`;

    res.json({
      message: "Invitation resent successfully",
      invitation: {
        id: invitation._id,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        inviteLink,
      }
    });

  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ message: "Failed to resend invitation" });
  }
}
