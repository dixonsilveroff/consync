import express from 'express';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
    testRoute,
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    bulkUpdateStatus,
    archiveTask,
    deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

// Public test route
router.get('/test', testRoute);

// Protected routes
router
    .route('/')
    .post(protect, authorizeRoles('contractor', 'engineer'), createTask)
    .get(protect, getTasks);

router
    .route('/:id')
    .get(protect, getTaskById)
    .put(protect, updateTask) // Let controller handle authorization
    .delete(protect, authorizeRoles('contractor'), deleteTask);

router.patch('/bulk-status', protect, authorizeRoles('contractor', 'engineer'), bulkUpdateStatus);
router.patch('/:id/archive', protect, authorizeRoles('contractor', 'engineer'), archiveTask);

export default router;