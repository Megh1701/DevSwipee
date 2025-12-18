import mongoose from "mongoose";

const swipeSchema = new mongoose.Schema(
  {
    swiperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    direction: {
      type: Boolean, 
      required: true,
    },
    status:{
        type:String,
        enum:["ignore","intrested","accepted","rejected"]
    }
  },
  { timestamps: true }
);

swipeSchema.index({ swiperId: 1, projectId: 1 }, { unique: true });

export default mongoose.model("Swipe", swipeSchema);
