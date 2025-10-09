import mongoose from 'mongoose';

const materialRequestSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String },
    estimatedCost: { type: Number },
  }],
  status: {
    type: String,
    enum: ['pending','approved','rejected','assigned','delivered'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  deliveryDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('MaterialRequest', materialRequestSchema);