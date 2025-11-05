import express from 'express';
import authMiddleware from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import Organization from '../models/organizationModel.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/organizations/:id - Get organization details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const organization = await Organization.findById(id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is a member of this organization
    const isMember = organization.members.some(
      memberId => memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this organization' });
    }

    return res.json(organization);
  } catch (error) {
    next(error);
  }
});

// GET /api/organizations/:id/members - Get organization members
router.get('/:id/members', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const organization = await Organization.findById(id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is a member of this organization
    const isMember = organization.members.some(
      memberId => memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this organization' });
    }

    // Fetch member details
    const members = await User.find({
      _id: { $in: organization.members }
    }).select('-passwordHash -refreshTokenHash');

    return res.json({ members });
  } catch (error) {
    next(error);
  }
});

// PUT /api/organizations/:id - Update organization (owner only)
router.put('/:id', authMiddleware, authorizeRoles('contractor'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, industry, location, phone, email, website, description } = req.body;

    const organization = await Organization.findById(id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is the owner
    if (organization.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the organization owner can update details' });
    }

    // Update fields
    if (name) organization.name = name;
    if (industry) organization.industry = industry;
    if (location) organization.location = location;
    if (phone !== undefined) organization.phone = phone;
    if (email !== undefined) organization.email = email;
    if (website !== undefined) organization.website = website;
    if (description !== undefined) organization.description = description;

    await organization.save();

    return res.json({ message: 'Organization updated successfully', organization });
  } catch (error) {
    next(error);
  }
});

export default router;
