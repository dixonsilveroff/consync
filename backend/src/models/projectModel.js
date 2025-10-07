import mongoose from "mongoose";

const { Schema } = mongoose;

const budgetSchema = new Schema({
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
}, { _id: false });

const documentSchema = new Schema({
  filename: String,
  url: String,
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: Date,
}, { _id: false });

const milestoneSchema = new Schema({
  title: String,
  description: String,
  dueDate: Date,
  status: { type: String, enum: ['pending','in_progress','done','blocked'], default: 'pending' },
  completedAt: Date,
}, { _id: false });

const projectSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  budget: { type: budgetSchema, default: () => ({}) },
  status: { type: String, enum: ['proposed','planned','active','paused','completed','cancelled'], default: 'proposed' },
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startDate: Date,
  endDate: Date,
  tags: [String],
  documents: [documentSchema],
  milestones: [milestoneSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  archived: { type: Boolean, default: false },
  progressPercent: { type: Number, default: 0 },
  lastProgressUpdate: { type: Date },
}, { timestamps: true });

// Full text search on title and description
projectSchema.index({ title: 'text', description: 'text' });

// Useful indexes for common queries
projectSchema.index({ status: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ owner: 1 });

export default mongoose.model('Project', projectSchema);
