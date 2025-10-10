import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import CostLine from '../models/costLineModel.js';
import Project from '../models/projectModel.js';
import logActivity from '../middleware/activityLogger.js';

// ✅ TEST ROUTE
export const testRoute = (req, res) => {
  res.json({ message: 'Finance route working' });
};

// ✅ CREATE COST LINE (Expense or Estimate)
export const createCostLine = asyncHandler(async (req, res) => {
  const { project, type, category, amount, description, note } = req.body;
  if (!project || !type || !amount) {
    res.status(400);
    throw new Error('Project, type, and amount are required');
  }

  const costLine = await CostLine.create({
    project,
    type,
    category,
    amount,
    description,
    note,
    recordedBy: req.user._id
  });

  await logActivity('COST_LINE_CREATED', 'Finance', costLine._id, req.user._id, `${type} recorded for project`, project);

  res.status(201).json({ success: true, data: costLine });
});

// ✅ GET ALL COST LINES (Optionally filter by project/type/date)
export const getCostLines = asyncHandler(async (req, res) => {
  const { project, type, startDate, endDate } = req.query;
  const filter = {};

  if (project) filter.project = project;
  if (type) filter.type = type;
  if (startDate && endDate) filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const costs = await CostLine.find(filter)
    .populate('project', 'title')
    .populate('recordedBy', 'name email')
    .sort('-date');

  res.json({ success: true, count: costs.length, data: costs });
});

// ✅ PROJECT COST SUMMARY
export const getProjectCostSummary = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;

  const summary = await CostLine.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const estimates = summary.find(s => s._id === 'estimate')?.totalAmount || 0;
  const expenses = summary.find(s => s._id === 'expense')?.totalAmount || 0;
  const adjustments = summary.find(s => s._id === 'adjustment')?.totalAmount || 0;

  const deviation = estimates - (expenses + adjustments);

  const report = {
    projectId,
    estimates,
    expenses,
    adjustments,
    deviation,
    variancePercent: estimates > 0 ? ((deviation / estimates) * 100).toFixed(1) : 0
  };

  res.json({ success: true, data: report });
});

// ✅ DELETE COST LINE
export const deleteCostLine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const costLine = await CostLine.findById(id);
  if (!costLine) {
    res.status(404);
    throw new Error('Cost entry not found');
  }

  await costLine.deleteOne();
  await logActivity('COST_LINE_DELETED', 'Finance', id, req.user._id, `Cost line removed`, costLine.project);

  res.status(204).json({ success: true });
});