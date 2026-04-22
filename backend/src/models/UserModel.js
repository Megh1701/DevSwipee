import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    age: { type: Number, required: true, min: 16, max: 60 },
    email: { type: String, unique: true },
    password: String,
    gender: String,
    avatar: String,
    city: String,
    verified: { type: Boolean, default: false },
    dailySwipeCount: {
      type: Number,
      default: 0,
    },
    swipeResetAt: {
      type: Date,
      default: Date.now,
    },
  
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    interests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Interest" }
    ],
    preferences: { type: mongoose.Schema.Types.ObjectId, ref: "UserPreference" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
