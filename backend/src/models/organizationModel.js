import mongoose from "mongoose";

const { Schema } = mongoose;

const organizationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // The contractor who owns this org
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }], // All users in this organization
  industry: { type: String, default: "" },
  location: { type: String, default: "" },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  logo: { type: String }, // URL to logo image
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Index for searching organizations
organizationSchema.index({ name: 'text', description: 'text' });
organizationSchema.index({ owner: 1 });

export default mongoose.model('Organization', organizationSchema);
