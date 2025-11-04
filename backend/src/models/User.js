import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, 
    enum: ["admin", "engineer", "client", "contractor"],
    default: "contractor" }, // Changed to contractor for Contractor-First Architecture
  phone: { type: String },
  bio: { type: String, maxlength: 500 },
  refreshTokenHash: { type: String, default: null },
  // Contractor-First Architecture fields
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  verified: { type: Boolean, default: true }, // default true for backward compatibility
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  onboardingCompleted: { type: Boolean, default: false },
}, { timestamps: true });

// static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model("User", userSchema);
