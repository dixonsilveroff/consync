import mongoose from 'mongoose';
import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import Notification from '../models/notificationModel.js';
import logActivity from '../middleware/activityLogger.js';

// Test route
export const testRoute = (req, res) => {
    res.status(200).json({ success: true, message: 'Tasks route working' });
};

// Create new task
export const createTask = async (req, res, next) => {
    try {
        const { title, project, dependencies = [], status = 'todo', createdBy } = req.body;

        // Validate required fields
        if (!title || !project) {
            return res.status(400).json({
                success: false,
                message: 'Title and project are required'
            });
        }

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(project)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }

        // Validate project exists
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Ensure createdBy is set
        if (!createdBy && req.user) {
            createdBy = req.user.id;
        }

        // Validate dependencies if provided
        if (dependencies.length > 0) {
            // Verify all dependencies exist and belong to same project
            const dependencyTasks = await Task.find({
                _id: { $in: dependencies },
                project
            });

            if (dependencyTasks.length !== dependencies.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid dependencies provided'
                });
            }

            // Check if any dependency is not done
            const hasBlockingDependency = dependencyTasks.some(task => task.status !== 'done');
            if (hasBlockingDependency) {
                req.body.status = 'blocked';
                
                // Log blocked status
                await logActivity(
                    'TASK_BLOCKED',
                    'Task',
                    task._id,
                    req.user._id,
                    `Task blocked due to dependencies`,
                    project
                );
            }
        }

        // Create task
        const task = await Task.create({
            ...req.body,
            createdBy: createdBy || req.user._id
        });

        // Return populated task
        const populatedTask = await task.populate([
            { path: 'project', select: 'title status' },
            { path: 'assignedTo', select: 'name email' }
        ]);

        // Log task creation
        await logActivity(
            'TASK_CREATED',
            'Task',
            task._id,
            req.user._id,
            `Task "${task.title}" created`,
            task.project,
            { status: task.status, priority: task.priority }
        );

        res.status(201).json({
            success: true,
            data: populatedTask
        });
    } catch (error) {
        next(error);
    }
};

// Get tasks with filtering and pagination
export const getTasks = async (req, res, next) => {
    try {
        const {
            project,
            status,
            priority,
            search,
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        const query = {};

        // Project filter
        if (project) query.project = project;

        // Status filter
        if (status) query.status = status;

        // Priority filter
        if (priority) query.priority = priority;

        // Role-based access control
        if (req.user.role === 'client') {
            // Clients can only see tasks from their projects
            const clientProjects = await Project.find({ client: req.user._id }).select('_id');
            query.project = { $in: clientProjects.map(p => p._id) };
        } else if (req.user.role === 'engineer') {
            // Engineers see tasks they're assigned to, created, or in their projects
            query.$or = [
                { assignedTo: req.user._id },
                { createdBy: req.user._id },
                { project: { $in: req.user.projects } }
            ];
        }
        // Admins can see all tasks (no additional filter)

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        
        const total = await Task.countDocuments(query);
        const tasks = await Task.find(query)
            .populate([
                { path: 'project', select: 'title status' },
                { path: 'assignedTo', select: 'name email' },
                { path: 'createdBy', select: 'name email' }
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: {
                tasks,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get single task by ID
export const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        // Get task with populated fields
        const task = await Task.findById(id)
            .populate([
                { path: 'project', select: 'title status' },
                { path: 'assignedTo', select: 'name email' },
                { path: 'createdBy', select: 'name email' },
                { path: 'dependencies', select: 'title status' }
            ]);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check access rights
        if (req.user.role === 'client') {
            const project = await Project.findById(task.project);
            if (!project || project.client.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this task'
                });
            }
        } else if (req.user.role === 'engineer') {
            const isAuthorized = 
                task.assignedTo?._id.toString() === req.user._id.toString() ||
                task.createdBy._id.toString() === req.user._id.toString() ||
                req.user.projects.includes(task.project._id);

            if (!isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this task'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

// Update task
export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        // Get existing task
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Store old status for comparison
        const oldStatus = task.status;

        // Check authorization
        if (req.user.role !== 'admin') {
            const isAuthorized = 
                task.createdBy.toString() === req.user._id.toString() ||
                task.assignedTo?.toString() === req.user._id.toString();

            if (!isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this task'
                });
            }
        }

        // Handle status changes
        if (updates.status) {
            if (updates.status === 'done') {
                updates.completedAt = new Date();
            } else if (['in_progress', 'review'].includes(updates.status)) {
                // Check if all dependencies are done
                const dependencies = await Task.find({
                    _id: { $in: task.dependencies }
                });
                
                const allDependenciesDone = dependencies.every(dep => dep.status === 'done');
                if (!allDependenciesDone) {
                    updates.status = 'blocked';
                }
            }
        }

        // Update task
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).populate([
            { path: 'project', select: 'title status' },
            { path: 'assignedTo', select: 'name email' },
            { path: 'createdBy', select: 'name email' }
        ]);

        // Log status change if it occurred
        if (oldStatus !== updatedTask.status) {
            await logActivity(
                'TASK_STATUS_UPDATED',
                'Task',
                updatedTask._id,
                req.user._id,
                `Task "${updatedTask.title}" status changed from ${oldStatus} to ${updatedTask.status}`,
                updatedTask.project,
                { oldStatus, newStatus: updatedTask.status }
            );
        }

        // Log general update if other fields changed
        if (Object.keys(updates).length > (updates.status ? 1 : 0)) {
            await logActivity(
                'TASK_UPDATED',
                'Task',
                updatedTask._id,
                req.user._id,
                `Task "${updatedTask.title}" updated`,
                updatedTask.project,
                { updatedFields: Object.keys(updates).filter(k => k !== 'status') }
            );
        }

        res.status(200).json({
            success: true,
            data: updatedTask
        });
    } catch (error) {
        next(error);
    }
};

// Bulk update task status
export const bulkUpdateStatus = async (req, res, next) => {
    try {
        const { taskIds, status } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || !status) {
            return res.status(400).json({
                success: false,
                message: 'Task IDs array and status are required'
            });
        }

        // Validate all task IDs
        const invalidIds = taskIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task IDs provided'
            });
        }

        // Get tasks and check access rights
        const tasks = await Task.find({ _id: { $in: taskIds } });
        
        // Verify all tasks exist
        if (tasks.length !== taskIds.length) {
            return res.status(404).json({
                success: false,
                message: 'Some tasks not found'
            });
        }

        // Check authorization for each task
        if (req.user.role !== 'admin') {
            const unauthorized = tasks.some(task => {
                const isAuthorized = 
                    task.createdBy.toString() === req.user._id.toString() ||
                    task.assignedTo?.toString() === req.user._id.toString();
                return !isAuthorized;
            });

            if (unauthorized) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update some tasks'
                });
            }
        }

        // Update tasks
        const completedAt = status === 'done' ? new Date() : undefined;
        const updateResult = await Task.updateMany(
            { _id: { $in: taskIds } },
            { 
                $set: { 
                    status,
                    ...(completedAt && { completedAt })
                }
            }
        );

        res.status(200).json({
            success: true,
            message: `Updated ${updateResult.modifiedCount} tasks`,
            data: { modifiedCount: updateResult.modifiedCount }
        });
    } catch (error) {
        next(error);
    }
};

// Archive/unarchive task
export const archiveTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'admin') {
            const project = await Project.findById(task.project);
            const isAuthorized = 
                task.createdBy.toString() === req.user._id.toString() ||
                project.client.toString() === req.user._id.toString();

            if (!isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to archive this task'
                });
            }
        }

        // Toggle archived status
        task.archived = !task.archived;
        await task.save();

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

// Delete task (admin only)
export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.deleteOne();

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};