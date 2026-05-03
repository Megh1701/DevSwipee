import express from "express";
import {
  createTask,
  getSessionTasks,
  updateTask,
  moveTask,
  assignTask,
  addComment,
  deleteTask
} from "../controllers/taskController.js";

import authMiddleware from "../middlewares/authMiddleware.js"

const router = express.Router();

router.post("/:sessionId/create", authMiddleware, createTask);
router.get("/tasks/:sessionId", authMiddleware, getSessionTasks);

router.patch("/:taskId/update", authMiddleware, updateTask);
router.patch("/:taskId/move", authMiddleware, moveTask);
router.patch("/:taskId/assign", authMiddleware, assignTask);

router.post("/:taskId/comment", authMiddleware, addComment);

router.delete("/:taskId", authMiddleware, deleteTask);

export default router;