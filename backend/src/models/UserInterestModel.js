import mongoose from "mongoose";

const userInterestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    interestId: { type: mongoose.Schema.Types.ObjectId, ref: "Interest", required: true },
  },
  { timestamps: true }
);

// a user cannot have the same interest twice
userInterestSchema.index({ userId: 1, interestId: 1 }, { unique: true });

export default mongoose.model("UserInterest", userInterestSchema);
