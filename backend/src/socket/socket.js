import { Server } from "socket.io";
import ChatModel from "../models/ChatModel.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM
    socket.on("joinRoom", (matchId) => {
      socket.join(matchId);
      console.log("Joined room:", matchId);
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

        // Send to everyone in room (including sender)
        io.to(data.matchId).emit("receiveMessage", message);

      } catch (error) {
        console.error("Message error:", error);
      }
    });

    // 🟢 USER TYPING
    socket.on("typing", ({ matchId, senderId }) => {
      socket.to(matchId).emit("userTyping", senderId);
    });

    // 🔴 USER STOP TYPING
    socket.on("stopTyping", ({ matchId, senderId }) => {
      socket.to(matchId).emit("userStoppedTyping", senderId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default initializeSocket;