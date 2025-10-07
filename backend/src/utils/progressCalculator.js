import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';

/**
 * Calculate and update the progress percentage of a project based on its tasks
 * @param {string} projectId - The ID of the project to calculate progress for
 * @returns {Promise<number>} The calculated progress percentage
 */
export const calculateProjectProgress = async (projectId) => {
  try {
    // Find all tasks for the project
    const tasks = await Task.find({ project: projectId });
    
    if (!tasks || tasks.length === 0) {
      // If no tasks, set progress to 0 and update project
      await Project.findByIdAndUpdate(projectId, {
        progressPercent: 0,
        lastProgressUpdate: new Date()
      });
      return 0;
    }

    // Count total and completed tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;

    // Calculate progress percentage (rounded to 1 decimal place)
    const progressPercent = Number(((completedTasks / totalTasks) * 100).toFixed(1));

    // Update project with new progress
    await Project.findByIdAndUpdate(projectId, {
      progressPercent,
      lastProgressUpdate: new Date()
    });

    return progressPercent;
  } catch (error) {
    console.error('Error calculating project progress:', error);
    throw error;
  }
};

export default {
  calculateProjectProgress
};