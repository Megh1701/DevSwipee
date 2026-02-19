import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    user1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

// 🔥 unique per project (CRITICAL)
matchSchema.index(
  { user1Id: 1, user2Id: 1, projectId: 1 },
  { unique: true }
);

export default mongoose.model("Match", matchSchema);