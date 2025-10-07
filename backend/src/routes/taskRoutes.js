import express from 'express';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorizeRoles.js';
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
    .post(protect, authorize(['admin', 'engineer']), createTask)
    .get(protect, getTasks);

router
    .route('/:id')
    .get(protect, getTaskById)
    .put(protect, authorize(['admin', 'engineer']), updateTask)
    .delete(protect, authorize(['admin']), deleteTask);

router.patch('/bulk-status', protect, authorize(['admin', 'engineer']), bulkUpdateStatus);
router.patch('/:id/archive', protect, authorize(['admin', 'engineer']), archiveTask);

export default router;