import UserModel from "../models/UserModel.js";
import InviteSession from "../models/InviteSessionModel.js";
import SessionModel from "../models/SessionModel.js";
import matchSchema from "../models/MatchModel.js"
import { getIO } from "../socket/socket.js";


export const sessionInvite = async (req, res) => {

    try {
        const io = getIO();
        const fromUser = req.user.id;
        const { projectName, assignmentMode, matchId } = req.body;

        if (!projectName || !matchId || !assignmentMode) {
            return res.status(400).json({ message: "projectname,assignmentMode and matchid are required" });
        }
        const match = await matchSchema.findById(matchId);

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        const isUser1 = String(match.user1Id) === fromUser;
        const isUser2 = String(match.user2Id) === fromUser;

        const toUser = isUser1
            ? match.user2Id
            : match.user1Id;

        if (String(toUser) == fromUser) {
            return res.status(403).json({
                message: "ivite yourself",
            });
        }

        const existing = await InviteSession.findOne({
            fromUser,
            toUser,
            projectName,
            assignmentMode,
            status: "PENDING",
        })

        if (existing) {

            return res.status(400).json({ message: "Invite already pending" });

        }
        const invite = await InviteSession.create({
            fromUser,
            toUser,
            projectName,
            assignmentMode,
            matchId,
        });

        io.to(toUser.toString()).emit("newInvite", invite);

        return res.status(201).json({
            message: "Session Invite sent",
            invite,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: "Invite already sent",
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Server error",
        });
    }
}

export const inviteResponse = async (req, res) => {
    try {
        const io = getIO();

        const userId = req.user.id;
        const { inviteId, status } = req.body;

        if (!inviteId || !status) {
            return res.status(400).json({
                message: "inviteId and status required",
            });
        }

        const invite = await InviteSession.findById(inviteId)

        if (!invite) {
            return res.status(404).json({ message: "Invite not found" });
        }

        if (String(invite.toUser) !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (invite.status !== "PENDING") {
            return res.status(400).json({
                message: "Invite already handled",
            });
        }

        if (status === "REJECTED") {
            invite.status = "REJECTED";

            await invite.save();

            io.to(invite.fromUser.toString()).emit("inviteRejected", invite)

            return res.json({
                message: "invite rejected",
                invite
            })
        }
        const match = await matchSchema.findById(invite.matchId);

        const isUser1 = String(match.user1Id) === userId;
        const isUser2 = String(match.user2Id) === userId;

        if (!isUser1 && !isUser2) {
            return res.status(403).json({ message: "Not part of match" });
        }

        if (status === "ACCEPTED") {

            const existingSession = await SessionModel.findOne({
                matchId: invite.matchId,
                members: {
                    $all: [
                        { $elemMatch: { userId: invite.fromUser } },
                        { $elemMatch: { userId: invite.toUser } },
                    ],
                },
            });

            if (existingSession) {
                return res.json({
                    message: "Session already exists",
                    session: existingSession,
                });
            }

            invite.status = "ACCEPTED";
            await invite.save();


            const session = await SessionModel.create({
                projectName: invite.projectName,
                assignmentMode: invite.assignmentMode,
                matchId: invite.matchId,
                owner: invite.fromUser,
                members: [
                    { userId: invite.fromUser, role: "OWNER" },
                    { userId: invite.toUser, role: "MEMBER" },
                ],
            });

            io.to(invite.matchId.toString()).emit("sessionCreated", session);

            io.to(invite.fromUser.toString()).emit("inviteAccepted", session);
            return res.json({
                message: "Session created",
                session,
            });
        }


    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
        });
    }
}

export const Getsession = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await SessionModel.findOne({
      "members.userId": userId,
      status: "ACTIVE",
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(404).json({ message: "No active session" });
    }

    return res.json({ session });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPendingInvites = async (req, res) => {
  try {
    const userId = req.user.id;

    const invites = await InviteSession.find({
      toUser: userId,
      status: "PENDING",
    }).sort({ createdAt: -1 });

    res.json({ invites });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};