import mongoose from "mongoose";

const InviteSessionSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectName: {
      type: String,
      required: true
    },
    assignmentMode: {
      type: String,
      enum: ["ANYONE", "OWNER_ONLY", "SELF_ONLY"],
      required: true
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING"
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 10
    }
  },
  { timestamps: true }
);

InviteSessionSchema.index(
  { fromUser: 1, toUser: 1, matchId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);

InviteSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("InviteSession",InviteSessionSchema)