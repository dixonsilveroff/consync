import mongoose from 'mongoose';
import Project from '../models/projectModel.js';
import User from '../models/User.js';
import Notification from '../models/notificationModel.js';
import logActivity from '../middleware/activityLogger.js';

/**
 * Simple test route to verify projects router is mounted.
 */
export const testRoute = (req, res) => {
  return res.json({ message: 'Projects route working' });
};

/**
 * Create a new project
 * Roles allowed: admin, engineer
 */
export const createProject = async (req, res, next) => {
  try {
    const allowedRoles = ['admin', 'engineer'];
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

    const payload = { ...req.body };
    // Ensure we have the correct user ID format
    const userId = req.user.id || req.user._id;
    payload.createdBy = userId;

    const project = await Project.create(payload);
    await project.populate([{ path: 'client', select: 'name email' }, { path: 'owner', select: 'name email' }, { path: 'assignedUsers', select: 'name email' }]);
    
    // Create notification for project creation
    await Notification.create({
      title: 'New Project Created',
      message: `${req.user.name} created a new project: ${project.title}`,
      type: 'info',
      relatedProject: project._id,
      user: project.client // Notify the client
    });

    // Notify assigned users
    if (project.assignedUsers && project.assignedUsers.length > 0) {
      await Promise.all(project.assignedUsers.map(user => 
        Notification.create({
          title: 'Project Assignment',
          message: `You have been assigned to the project: ${project.title}`,
          type: 'info',
          relatedProject: project._id,
          user: user._id
        })
      ));
    }

    // Log project creation activity
    await logActivity(
      'PROJECT_CREATED',
      'Project',
      project._id,
      userId, // Use the same userId we verified earlier
      `Project "${project.title}" created`,
      project._id
    );

    return res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * Get projects with filtering, search, pagination, and role-based access control
 */
export const getProjects = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const { page = 1, limit = 20, status, search, sort = '-createdAt' } = req.query;
    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(100, parseInt(limit, 10) || 20);

    const filter = { archived: false };

    if (status) filter.status = status;

    if (search) filter.$text = { $search: search };

    // Role-based filter
    const role = req.user.role;
    const userId = req.user._id || req.user.id;

    if (role === 'admin') {
      // no extra constraints
    } else if (role === 'client') {
      filter.client = userId; // MongoDB will handle the type conversion
    } else {
      // engineer/contractor/other: assigned, owner, or createdBy
      filter.$or = [
        { assignedUsers: new mongoose.Types.ObjectId(userId) },
        { owner: new mongoose.Types.ObjectId(userId) },
        { createdBy: new mongoose.Types.ObjectId(userId) },
      ];
    }

    const total = await Project.countDocuments(filter);
    const pages = Math.ceil(total / lim) || 1;
    const skip = (pg - 1) * lim;

    const query = Project.find(filter)
      .populate('assignedUsers', 'name email')
      .populate('owner', 'name email')
      .populate('client', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(lim);

    const projects = await query.exec();

    return res.json({ success: true, data: projects, meta: { total, page: pg, limit: lim, pages } });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single project by id with access control
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid project id' });

    const project = await Project.findById(id)
      .populate('assignedUsers', 'name email')
      .populate('owner', 'name email')
      .populate('client', 'name email')
      .exec();

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Access control
    const role = req.user && req.user.role;
    const userId = req.user && (req.user._id || req.user.id);

    const isAdmin = role === 'admin';
    const isClient = project.client && project.client._id && project.client._id.toString() === userId;
    const isOwner = project.owner && project.owner._id && project.owner._id.toString() === userId;
    const isAssigned = project.assignedUsers && project.assignedUsers.some(u => u._id && u._id.toString() === userId);

    if (!(isAdmin || isClient || isOwner || isAssigned)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a project (whitelisted fields)
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid project id' });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const userId = req.user && (req.user._id || req.user.id);
    const role = req.user && req.user.role;

    const isAdmin = role === 'admin';
    const isOwner = project.owner && project.owner.toString() === userId;
    const isAssigned = project.assignedUsers && project.assignedUsers.map(String).includes(String(userId));

    if (!(isAdmin || isOwner || isAssigned)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Whitelist fields
    const allowed = ['title','description','budget','status','startDate','endDate','assignedUsers','tags','milestones','documents','archived','client','owner'];
    allowed.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        project[field] = req.body[field];
      }
    });

    project.updatedBy = userId;
    await project.save();
    await project.populate([{ path: 'client', select: 'name email' }, { path: 'owner', select: 'name email' }, { path: 'assignedUsers', select: 'name email' }]);

    return res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle archive flag (soft-delete)
 */
export const archiveProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid project id' });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const userId = req.user && (req.user._id || req.user.id);
    const role = req.user && req.user.role;

    const isAdmin = role === 'admin';
    const isOwner = project.owner && project.owner.toString() === userId;

    if (!(isAdmin || isOwner)) return res.status(403).json({ success: false, message: 'Forbidden' });

    project.archived = !project.archived;
    project.updatedBy = userId;
    await project.save();

    return res.json({ success: true, data: project, message: project.archived ? 'Project archived' : 'Project unarchived' });
  } catch (err) {
    next(err);
  }
};

/**
 * Hard delete a project - admin only
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid project id' });

    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await project.remove();

    return res.status(204).json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};
