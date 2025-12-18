import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    preferredInterests: [String], 
    preferredCity: String,
    popularity: Number,
  },
  { timestamps: true }
);

export default mongoose.model("UserPreference", userPreferenceSchema);
