import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    age: { type: Number, required: true, min: 16, max: 60 },
    email: { type: String, unique: true },
    password: String,
    gender: String,
    avatar: String,
    city: {
      type: String, 
      required: true
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], 
        required: true
      }
    },
    verified: { type: Boolean, default: false },
    dailySwipeCount: {
      type: Number,
      default: 0,
    },
    swipeResetAt: {
      type: Date,
      default: Date.now,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiry: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    interests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Interest" }
    ],
    preferences: { type: mongoose.Schema.Types.ObjectId, ref: "UserPreference" },
  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
