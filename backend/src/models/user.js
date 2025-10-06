import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true, lowercase: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["Client", "Contractor", "Supplier", "ProjectEngineer", "Admin"],
    default: "Client",
  },
  // store hashed refresh token to support rotation/invalidation
  refreshTokenHash: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

userSchema.methods.clearRefreshToken = function () {
  this.refreshTokenHash = null;
  return this.save();
};

export default mongoose.model("User", userSchema);
