import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
   
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
      index: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM"
    },

    order: {
      type: Number,
      default: 0
    },

    labels: [
      {
        type: String,
        trim: true
      }
    ],

    dueDate: {
      type: Date,
      default: null
    },

    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    activity: [
      {
        action: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

TaskSchema.index({ sessionId: 1, status: 1 });

TaskSchema.index(
  { sessionId: 1, status: 1, order: 1 },
  { unique: false }
);

export default mongoose.model("Task", TaskSchema);