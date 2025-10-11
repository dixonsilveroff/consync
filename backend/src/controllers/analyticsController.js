import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import CostLine from '../models/costLineModel.js';
import Activity from '../models/activityModel.js';

// ✅ TEST ROUTE
export const testRoute = (req, res) => {
  res.json({ message: 'Analytics route working' });
};

// ✅ 1️⃣ GLOBAL SUMMARY
// Summarizes all projects, tasks, and costs across the system
export const getGlobalSummary = asyncHandler(async (req, res) => {
  const totalProjects = await Project.countDocuments();
  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ status: 'done' });

  const totalExpensesAgg = await CostLine.aggregate([
    { $match: { type: 'expense' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalExpenses = totalExpensesAgg[0]?.total || 0;

  const avgProgressAgg = await Project.aggregate([
    { $group: { _id: null, avgProgress: { $avg: '$progressPercent' } } }
  ]);
  const avgProgress = avgProgressAgg[0]?.avgProgress?.toFixed(1) || 0;

  const globalSummary = {
    totalProjects,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
    avgProgress,
    totalExpenses
  };

  res.json({ success: true, data: globalSummary });
});

// ✅ 2️⃣ PROJECT ANALYTICS
// Returns combined progress, cost, and task stats for one project
export const getProjectAnalytics = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const taskStats = await Task.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const costAgg = await CostLine.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const expenses = costAgg.find(c => c._id === 'expense')?.totalAmount || 0;
  const estimates = costAgg.find(c => c._id === 'estimate')?.totalAmount || 0;
  const deviation = estimates - expenses;
  const variancePercent = estimates > 0 ? ((deviation / estimates) * 100).toFixed(1) : 0;

  const totalTasks = taskStats.reduce((sum, t) => sum + t.count, 0);
  const doneTasks = taskStats.find(t => t._id === 'done')?.count || 0;
  const completionRate = totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(1) : 0;

  const analytics = {
    projectId,
    projectTitle: project.title,
    progressPercent: project.progressPercent,
    totalTasks,
    doneTasks,
    completionRate,
    estimates,
    expenses,
    deviation,
    variancePercent,
    lastProgressUpdate: project.lastProgressUpdate
  };

  res.json({ success: true, data: analytics });
});

// ✅ 3️⃣ ACTIVITY TRENDS
// Aggregates number of activities per day (last 14 days)
export const getActivityTrends = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const trends = await Activity.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, data: trends });
});

// ✅ 4️⃣ COST PERFORMANCE OVER TIME (for charts)
export const getCostTrend = asyncHandler(async (req, res) => {
  const { project } = req.query;
  if (!project) {
    res.status(400);
    throw new Error('Project ID required');
  }

  const trend = await CostLine.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(project), type: 'expense' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, data: trend });
});