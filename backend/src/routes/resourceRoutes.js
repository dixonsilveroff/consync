import express from 'express';
import {
  testRoute,
  createMaterialRequest,
  approveMaterialRequest,
  assignVendor,
  markDelivered,
  getMaterialRequests,
  createVendor,
  getVendors
} from '../controllers/resourceController.js';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get('/test', testRoute);

// Material Requests
router.post('/requests', protect, authorizeRoles('engineer','admin'), createMaterialRequest);
router.get('/requests', protect, getMaterialRequests);
router.patch('/requests/:id/approve', protect, authorizeRoles('admin'), approveMaterialRequest);
router.patch('/requests/:id/assign', protect, authorizeRoles('admin'), assignVendor);
router.patch('/requests/:id/deliver', protect, authorizeRoles('admin','engineer'), markDelivered);

// Vendors
router.post('/vendors', protect, authorizeRoles('admin'), createVendor);
router.get('/vendors', protect, getVendors);

export default router;