import mongoose from 'mongoose';

const costLineSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  type: { type: String, enum: ['estimate','expense','adjustment'], required: true },
  category: { type: String, enum: ['materials','labor','equipment','subcontract','overhead','other'], default: 'other' },
  description: { type: String, trim: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String },
}, { timestamps: true });

costLineSchema.index({ project: 1, type: 1, category: 1 });

export default mongoose.model('CostLine', costLineSchema);