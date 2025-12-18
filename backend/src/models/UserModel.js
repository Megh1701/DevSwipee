import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    email: { type: String, unique: true },
    password: String,
    gender: String,
    avatar: String,
    city: String,
    verified: { type: Boolean, default: false },

    // relations
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserInterest" }],
    preferences: { type: mongoose.Schema.Types.ObjectId, ref: "UserPreference" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
