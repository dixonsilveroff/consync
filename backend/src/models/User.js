import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, 
    enum: ["engineer", "client", "contractor", "supplier"],
    default: "contractor" }, // Contractor is the primary admin role
  phone: { type: String },
  bio: { type: String, maxlength: 500 },
  refreshTokenHash: { type: String, default: null },
  
  // Contractor-First Architecture fields
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  verified: { type: Boolean, default: true }, // default true for backward compatibility
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  onboardingCompleted: { type: Boolean, default: false },
  
  // Supplier Marketplace fields (only for role=supplier)
  supplierProfile: {
    businessName: { type: String },
    businessType: { type: String }, // e.g., "Building Materials", "Electrical", "Plumbing"
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    serviceRadius: { type: Number, default: 50 }, // in kilometers/miles
    specializations: [String], // e.g., ["Cement", "Steel", "Timber"]
    certifications: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    logo: { type: String },
    description: { type: String, maxlength: 1000 },
    workingHours: { type: String },
    website: { type: String },
    minimumOrder: { type: Number },
    deliveryOptions: [String], // e.g., ["Pickup", "Delivery", "Express"]
    paymentMethods: [String], // e.g., ["Cash", "Bank Transfer", "Card"]
    isActive: { type: Boolean, default: true }, // Can suppliers pause their listing
    featured: { type: Boolean, default: false }, // Premium/featured suppliers
  }
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
