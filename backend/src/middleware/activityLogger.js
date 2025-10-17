import Activity from '../models/activityModel.js';
import calculateProjectProgress from '../utils/progressCalculator.js';

/**
 * Log an activity in the system
 * @param {string} action - The type of action performed
 * @param {string} entityType - The type of entity the action was performed on
 * @param {string} entityId - The ID of the entity
 * @param {string} userId - The ID of the user who performed the action
 * @param {string} message - A human-readable description of the action
 * @param {string} [projectId] - Optional project ID if the activity is related to a project
 * @param {Object} [metadata] - Optional additional data about the action
 * @returns {Promise<Activity>} The created activity document
 */
const logActivity = async (action, entityType, entityId, userId, message, projectId = null, metadata = {}) => {
  try {
    // Debug logging
    console.log('=== Activity Logger ===');
    console.log('Action:', action);
    console.log('Entity Type:', entityType);
    console.log('Entity ID:', entityId);
    console.log('User ID:', userId);
    console.log('Project ID:', projectId);
    console.log('Message:', message);
    
    // Create the activity document
    const activity = await Activity.create({
      action,
      entityType,
      entityId,
      message,
      project: projectId,
      user: userId,
      metadata
    });

    // If this is a task status update, recalculate project progress
    if (entityType === 'Task' && action === 'TASK_STATUS_UPDATED' && projectId) {
      await calculateProjectProgress(projectId);
    }

    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    console.error('Activity data that failed:', {
      action,
      entityType,
      entityId,
      userId,
      projectId,
      message,
      metadata
    });
    throw error;
  }
};

export default logActivity;