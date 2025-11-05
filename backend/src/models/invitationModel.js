import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const invitationSchema = new Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  role: { 
    type: String, 
    required: true,
    enum: ["engineer", "client"], // Only engineer and client can be invited (suppliers self-register for marketplace)
  },
  token: { type: String, required: true, unique: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // The contractor who sent invite
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' }, // Optional: specific project context
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'expired', 'cancelled'],
    default: 'pending'
  },
  expiresAt: { type: Date, required: true },
  acceptedAt: { type: Date },
  message: { type: String }, // Optional custom message from inviter
}, { timestamps: true });

// Indexes for efficient queries
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ token: 1 });
invitationSchema.index({ organization: 1 });
invitationSchema.index({ invitedBy: 1 });
invitationSchema.index({ expiresAt: 1 }); // For cleanup of expired invitations

// Static method to generate secure token
invitationSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Method to check if invitation is still valid
invitationSchema.methods.isValid = function() {
  return this.status === 'pending' && this.expiresAt > new Date();
};

export default mongoose.model('Invitation', invitationSchema);
