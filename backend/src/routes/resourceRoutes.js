import express from 'express';
import {
  testRoute,
  createMaterialRequest,
  getMaterialRequests,
  getMaterialRequestById,
  updateMaterialRequest,
  approveMaterialRequest,
  rejectMaterialRequest,
  deleteMaterialRequest,
  assignVendor,
  markDelivered,
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor
} from '../controllers/resourceController.js';
import protect from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get('/test', testRoute);

// Material Requests
router.post('/requests', protect, authorizeRoles('engineer','contractor'), createMaterialRequest);
router.get('/requests', protect, getMaterialRequests);
router.get('/requests/:id', protect, getMaterialRequestById);
router.put('/requests/:id', protect, authorizeRoles('engineer','contractor'), updateMaterialRequest);
router.patch('/requests/:id/approve', protect, authorizeRoles('contractor'), approveMaterialRequest);
router.patch('/requests/:id/reject', protect, authorizeRoles('contractor'), rejectMaterialRequest);
router.delete('/requests/:id', protect, authorizeRoles('contractor'), deleteMaterialRequest);
router.patch('/requests/:id/assign', protect, authorizeRoles('contractor'), assignVendor);
router.patch('/requests/:id/deliver', protect, authorizeRoles('contractor','engineer'), markDelivered);

// Vendors
router.post('/vendors', protect, authorizeRoles('contractor'), createVendor);
router.get('/vendors', protect, getVendors);
router.get('/vendors/:id', protect, getVendorById);
router.put('/vendors/:id', protect, authorizeRoles('contractor'), updateVendor);
router.delete('/vendors/:id', protect, authorizeRoles('contractor'), deleteVendor);

export default router;