import mongoose from "mongoose";


const SessionSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true
    },
    assignmentMode: {
        type: String,
        enum: ["ANYONE",
            "OWNER_ONLY",
            "SELF_ONLY"],
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", 'ENDED'],
        default: "ACTIVE"
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["MEMBER","OWNER"],
            default:"MEMBER"
        }
    }]

},

    { timestamps: true }
)
SessionSchema.index(
  { matchId: 1, "members.userId": 1 },
  { unique: false } 
);

export default mongoose.model("Session", SessionSchema);