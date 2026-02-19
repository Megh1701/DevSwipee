import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      trim: true,
    },
    description: {
    type: String,
    trim: true,
    required: true,
    validate: {
      validator: function(value) {
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 150;
      },
      message: 'Description must be at least 150 words'
    }
  },
    domain: {
      type: String,
      trim: true,
    },
    stack: {
      type: String,
      trim: true,
    },
    ProjectStatus: {
      type: String,
      enum:["idea","inProgress","completed"],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },

    githubUrl: {
      type: String,
      trim: true,
   
    },

    liveDemoUrl: {
      type: String,
      trim: true,

    },
    likeCount: {
      type: Number,
      default: 0,
    },

    dislikeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
