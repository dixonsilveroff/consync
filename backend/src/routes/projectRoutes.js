import express from 'express';
import authMiddleware from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import * as projectController from '../controllers/projectController.js';
import { validate, createProjectSchema, updateProjectSchema } from '../validators/projectValidator.js';

const router = express.Router();

// Public test route
router.get('/test', projectController.testRoute);

// Create project - contractor only (Contractor-First Architecture)
router.post('/', authMiddleware, authorizeRoles('contractor'), validate(createProjectSchema), projectController.createProject);

// List projects - protected
router.get('/', authMiddleware, projectController.getProjects);

// Get single project
router.get('/:id', authMiddleware, projectController.getProjectById);

// Update project - contractor/engineer/owner (owner access is enforced in controller)
router.put('/:id', authMiddleware, authorizeRoles('contractor', 'engineer'), validate(updateProjectSchema), projectController.updateProject);

// Archive/unarchive project - contractor or owner (owner enforced in controller)
router.patch('/:id/archive', authMiddleware, authorizeRoles('contractor', 'engineer'), projectController.archiveProject);

// Delete project - contractor only
router.delete('/:id', authMiddleware, authorizeRoles('contractor'), projectController.deleteProject);

export default router;
