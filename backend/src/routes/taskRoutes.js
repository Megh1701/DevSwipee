import express from "express";
import {
  createTask,
  getSessionTasks,
  updateTask,
  moveTask,
  assignTask,
  deleteTask
} from "../controllers/taskController.js";

import authMiddleware from "../middlewares/authMiddleware.js"

const router = express.Router();

router.post("/:sessionId/create", authMiddleware, createTask);
router.get("/tasks/:sessionId", authMiddleware, getSessionTasks);

router.patch("/:taskId/update", authMiddleware, updateTask);
router.patch("/tasks/:taskId/move", authMiddleware, moveTask);

router.patch("/:taskId/assign", authMiddleware, assignTask);

router.delete("/delete/:taskId", authMiddleware, deleteTask);

export default router;