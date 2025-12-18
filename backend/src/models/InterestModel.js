import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Interest", interestSchema);
