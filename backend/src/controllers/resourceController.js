import asyncHandler from 'express-async-handler';
import MaterialRequest from '../models/materialRequestModel.js';
import Vendor from '../models/vendorModel.js';
import logActivity from '../middleware/activityLogger.js';

// ✅ TEST ROUTE
export const testRoute = (req, res) => {
  res.json({ message: 'Resources route working' });
};

// ✅ CREATE MATERIAL REQUEST
export const createMaterialRequest = asyncHandler(async (req, res) => {
  const { project, items, notes } = req.body;
  if (!project || !items || items.length === 0) {
    res.status(400);
    throw new Error('Project and items are required');
  }

  const materialRequest = await MaterialRequest.create({
    project,
    requestedBy: req.user._id,
    items,
    notes
  });

  await logActivity('MATERIAL_REQUEST_CREATED', 'Resource', materialRequest._id, req.user._id,
    `Material request created for project ${project}`, project);

  res.status(201).json({ success: true, data: materialRequest });
});

// ✅ APPROVE MATERIAL REQUEST
export const approveMaterialRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const materialRequest = await MaterialRequest.findById(id);
  if (!materialRequest) {
    res.status(404);
    throw new Error('Material request not found');
  }

  materialRequest.status = 'approved';
  materialRequest.approvedBy = req.user._id;
  await materialRequest.save();

  await logActivity('MATERIAL_REQUEST_APPROVED', 'Resource', id, req.user._id,
    `Material request approved`, materialRequest.project);

  res.json({ success: true, data: materialRequest });
});

// ✅ ASSIGN VENDOR
export const assignVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vendorId, deliveryDate } = req.body;

  const materialRequest = await MaterialRequest.findById(id);
  if (!materialRequest) {
    res.status(404);
    throw new Error('Material request not found');
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  materialRequest.vendor = vendorId;
  materialRequest.status = 'assigned';
  materialRequest.deliveryDate = deliveryDate;
  await materialRequest.save();

  await logActivity('VENDOR_ASSIGNED', 'Resource', id, req.user._id,
    `Vendor ${vendor.name} assigned to material request`, materialRequest.project);

  res.json({ success: true, data: materialRequest });
});

// ✅ MARK AS DELIVERED
export const markDelivered = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const materialRequest = await MaterialRequest.findById(id);
  if (!materialRequest) {
    res.status(404);
    throw new Error('Material request not found');
  }

  materialRequest.status = 'delivered';
  await materialRequest.save();

  await logActivity('MATERIAL_DELIVERED', 'Resource', id, req.user._id,
    `Materials delivered for project`, materialRequest.project);

  res.json({ success: true, data: materialRequest });
});

// ✅ FETCH MATERIAL REQUESTS
export const getMaterialRequests = asyncHandler(async (req, res) => {
  const { project, status } = req.query;
  const filter = {};

  if (project) filter.project = project;
  if (status) filter.status = status;

  const requests = await MaterialRequest.find(filter)
    .populate('project', 'title')
    .populate('vendor', 'name')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort('-createdAt');

  res.json({ success: true, data: requests });
});

// ✅ CREATE & FETCH VENDORS
export const createVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.create(req.body);
  res.status(201).json({ success: true, data: vendor });
});

export const getVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find().sort('name');
  res.json({ success: true, data: vendors });
});