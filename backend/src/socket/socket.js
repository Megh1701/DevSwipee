import { Server } from "socket.io";
import ChatModel from "../models/ChatModel.js";

let io;
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    

    // JOIN SESSION ROOM (FOR TASK COLLABORATION)
    socket.on("join-session", (sessionId) => {
      socket.join(sessionId);
      console.log(`User ${socket.id} joined session room: ${sessionId}`);
    });

    // JOIN CHAT ROOM (MATCH)
    socket.on("joinRoom", (matchId) => {
      socket.join(matchId);
      console.log(`Joined match room: ${matchId}`);
    });

    // JOIN USER ROOM (NOTIFICATIONS)
    socket.on("joinUserRoom", (userId) => {
      socket.join(userId);
      console.log(`Joined user room: ${userId}`);
    });

    // SEND MESSAGE
    socket.on("sendMessage", async (data) => {
      try {
        const message = await ChatModel.create({
          matchId: data.matchId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
        });

        const populatedMessage = await ChatModel.findById(message._id)
          .populate("senderId", "_id name");

        io.to(data.matchId).emit("receiveMessage", populatedMessage);
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // TYPING
    socket.on("typing", ({ matchId, senderId }) => {
      socket.to(matchId).emit("userTyping", senderId);
    });

    socket.on("stopTyping", ({ matchId, senderId }) => {
      socket.to(matchId).emit("userStoppedTyping", senderId);
    });

    // TASK UPDATES (Broadcast to session room)
    socket.on("updateTask", (sessionId, taskData) => {
      io.to(sessionId).emit("taskUpdated", taskData);
    });

    socket.on("deleteTask", (sessionId, taskId) => {
      io.to(sessionId).emit("taskDeleted", taskId);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
// GET IO INSTANCE
export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized. Call initializeSocket(server) first.");
  }
  return io;
};