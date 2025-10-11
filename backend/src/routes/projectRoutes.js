import express from 'express';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import authMiddleware from "../middleware/auth.js";
import * as projectController from '../controllers/projectController.js';
import { validate, createProjectSchema, updateProjectSchema } from '../validators/projectValidator.js';

const router = express.Router();

// Public test route
router.get('/test', projectController.testRoute);

// Create project - only admin & engineer
router.post('/', protect, authorizeRoles('admin', 'engineer'), validate(createProjectSchema), projectController.createProject);

// List projects - protected
router.get('/', protect, projectController.getProjects);

// Get single project
router.get('/:id', protect, projectController.getProjectById);

// Update project - admin/engineer/owner (authorizeRoles middleware checks role names only;
// owner access is enforced in controller)
router.put('/:id', authMiddleware, authorizeRoles('admin', 'engineer'), validate(updateProjectSchema), projectController.updateProject);

// Archive/unarchive project - admin or owner (owner enforced in controller)
router.patch('/:id/archive', authMiddleware, authorizeRoles('admin', 'engineer'), projectController.archiveProject);

// Delete project - admin only
router.delete('/:id', authMiddleware, authorizeRoles('admin'), projectController.deleteProject);

export default router;
