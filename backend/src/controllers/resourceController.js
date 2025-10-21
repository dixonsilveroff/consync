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

// ✅ GET MATERIAL REQUEST BY ID
export const getMaterialRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const materialRequest = await MaterialRequest.findById(id)
    .populate('project', 'title')
    .populate('vendor', 'name contactPerson phone email')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!materialRequest) {
    res.status(404);
    throw new Error('Material request not found');
  }

  res.json({ success: true, data: materialRequest });
});

// ✅ UPDATE MATERIAL REQUEST
export const updateMaterialRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const materialRequest = await MaterialRequest.findById(id);

  if (!materialRequest) {
    res.status(404);
    throw new Error('Material request not found');
  }

  // Update allowed fields
  const allowedUpdates = ['items', 'notes', 'deliveryDate'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      materialRequest[field] = req.body[field];
    }
  });

  await materialRequest.save();

  await logActivity('MATERIAL_REQUEST_UPDATED', 'Resource', id, req.user._id,
    `Material request updated`, materialRequest.project);

  res.json({ success: true, data: materialRequest });
});

// ✅ REJECT MATERIAL REQUEST
export const rejectMaterialRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const materialRequest = await MaterialRequest.findById(id);
  if (!materialRequest) {
    res.status(404);
    throw new Error('Material request not found');
  }

  materialRequest.status = 'rejected';
  materialRequest.notes = reason ? `${materialRequest.notes || ''}\nRejection reason: ${reason}` : materialRequest.notes;
  await materialRequest.save();

  await logActivity('MATERIAL_REQUEST_REJECTED', 'Resource', id, req.user._id,
    `Material request rejected`, materialRequest.project);

  res.json({ success: true, data: materialRequest });
});

// ✅ DELETE MATERIAL REQUEST
export const deleteMaterialRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const materialRequest = await MaterialRequest.findById(id);

  if (!materialRequest) {
    res.status(404);
    throw new Error('Material request not found');
  }

  await MaterialRequest.findByIdAndDelete(id);

  await logActivity('MATERIAL_REQUEST_DELETED', 'Resource', id, req.user._id,
    `Material request deleted`, materialRequest.project);

  res.json({ success: true, message: 'Material request deleted' });
});

// ✅ GET VENDOR BY ID
export const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findById(id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  res.json({ success: true, data: vendor });
});

// ✅ UPDATE VENDOR
export const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findById(id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    vendor[key] = req.body[key];
  });

  await vendor.save();

  await logActivity('VENDOR_UPDATED', 'Resource', id, req.user._id,
    `Vendor ${vendor.name} updated`);

  res.json({ success: true, data: vendor });
});

// ✅ DELETE VENDOR
export const deleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findById(id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Check if vendor is assigned to any active material requests
  const activeRequests = await MaterialRequest.countDocuments({
    vendor: id,
    status: { $in: ['assigned', 'pending', 'approved'] }
  });

  if (activeRequests > 0) {
    res.status(400);
    throw new Error('Cannot delete vendor with active material requests');
  }

  await Vendor.findByIdAndDelete(id);

  await logActivity('VENDOR_DELETED', 'Resource', id, req.user._id,
    `Vendor ${vendor.name} deleted`);

  res.json({ success: true, message: 'Vendor deleted' });
});