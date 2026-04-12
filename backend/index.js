import dotenv from "dotenv";
dotenv.config();

const startServer = async () => {
  const express = (await import("express")).default;
  const http = (await import("http")).default;
  const cors = (await import("cors")).default;
  const cookieParser = (await import("cookie-parser")).default;

  const connectDB = (await import("./src/db/dbconnection.js")).default;
  const authRoutes = (await import("./src/routes/authRoutes.js")).default;
  const uploadRoutes = (await import("./src/routes/uploadRoutes.js")).default;
  const profileDataRoutes = (await import("./src/routes/profileDataRoutes.js")).default;
  const projectFeedRoutes = (await import("./src/routes/projectFeed.js")).default;
  const SwipeHandler = (await import("./src/routes/swiphandleRoutes.js")).default;
  const projectDetailRoutes = (await import("./src/routes/projectDetailRoutes.js")).default;
  const matchesRouter = (await import("./src/routes/matchesRoutes.js")).default;
  const chatRoutes = (await import("./src/routes/chatRoutes.js")).default;
  const atsRoutes = (await import("./src/routes/atsRoutes.js")).default;
  const InviteSession = (await import("./src/routes/invitesessionRoutes.js")).default;
  const socketModule = await import("./src/socket/socket.js");

  const initializeSocket = socketModule.initializeSocket;

  await connectDB();

  const app = express();
  const server = http.createServer(app);

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use("/auth", authRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api", projectDetailRoutes);
  app.use("/api", profileDataRoutes);
  app.use("/api", projectFeedRoutes);
  app.use("/api", SwipeHandler);
  app.use("/api/matches", matchesRouter);
  app.use("/api/chat", chatRoutes);
  app.use("/api/ats", atsRoutes);

  // 🔥 Initialize Socket (separate file)
  initializeSocket(server);


  app.use("/api/session", InviteSession);
app.use("/api/session", InviteSession);
  server.listen(3000, () =>
    console.log("Server running on port 3000")
  );
};

startServer();