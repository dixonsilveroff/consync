import Activity from '../models/activityModel.js';
import { isValidObjectId } from 'mongoose';

/**
 * Get activities with filtering and pagination
 */
export const getActivities = async (req, res, next) => {
  try {
    const { entityType, entityId, project, user, page = 1, limit = 10 } = req.query;
    const query = {};

    // Build query based on user role and filters
    if (req.user.role === 'client') {
      // Clients can only see activities related to their projects
      query.$or = [
        { 'project.client': req.user._id },
        { user: req.user._id }
      ];
    } else if (req.user.role === 'engineer') {
      // Engineers can see activities where they are the user or related to projects they're assigned to
      query.$or = [
        { user: req.user._id },
        { 'project.assignedUsers': req.user._id }
      ];
    }
    // Contractors can see all activities (no additional filter)

    // Apply filters if provided
    if (entityType) query.entityType = entityType;
    if (entityId && isValidObjectId(entityId)) query.entityId = entityId;
    if (project && isValidObjectId(project)) query.project = project;
    if (user && isValidObjectId(user)) query.user = user;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .populate('project', 'title'),
      Activity.countDocuments(query)
    ]);

    // Calculate total pages
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single activity by ID
 */
export const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID'
      });
    }

    const activity = await Activity.findById(id)
      .populate('user', 'name email')
      .populate('project', 'title');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an activity (contractor only)
 */
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID'
      });
    }

    const activity = await Activity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test route
 */
export const testRoute = async (req, res) => {
  res.status(200).json({
    message: 'Activity route working'
  });
};

export default {
  getActivities,
  getActivityById,
  deleteActivity,
  testRoute
};