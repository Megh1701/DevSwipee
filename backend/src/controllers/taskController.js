import UserModel from "../models/UserModel.js";
import TaskModel from "../models/TaskModel.js";
import SessionModel from "../models/SessionModel.js";
import { getIO } from "../socket/socket.js";

export const createTask = async (req, res) => {

const io=getIO();

    try {

        const user = req.user.id;
        const { sessionId } = req.params;
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
        } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                message: "Task title is required",
            });
        }

        const session = await SessionModel.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                message: "Session not found",
            });
        }

        const lastTask = await TaskModel.findOne({
            sessionId,
            status: "TODO"
        }).sort({ order: -1 });

        const nextOrder = lastTask ? lastTask.order + 1 : 0;

        const task = await TaskModel.create({
            sessionId,
            title,
            description: description || "",
            priority: priority || "MEDIUM",
            dueDate: dueDate || null,
              assignedBy: req.user.id,
            assignedTo,
            createdBy: user,

            status: "TODO",

            order: nextOrder,

            activity: [
                {
                    type: "CREATED",
                    user,
                    message: "Task created",
                },
            ],
        });

        io.to(sessionId).emit("taskCreated",task)

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task,
        });
    } catch (err) {
        console.error("Create Task Error:", err);

        return res.status(500).json({
            message: "Server error",
        });
    }
}
export const getSessionTasks = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await SessionModel.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                message: "Session not found",
            });
        }


        const tasks = await TaskModel.find({ sessionId })
            .sort({ order: 1 })
            .populate("assignedTo", "name email avatar")
            .populate("createdBy", "name email")


        return res.status(200).json({
            success: true,
            tasks,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}
export const updateTask = async (req, res) => {
}
export const moveTask = async (req, res) => {
}
export const assignTask = async (req, res) => {
}
export const addComment = async (req, res) => {
}
export const deleteTask = async (req, res) => {
}