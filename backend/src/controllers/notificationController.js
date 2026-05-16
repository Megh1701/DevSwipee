import Notification from "../models/NotificationModel.js";
import { getIO } from "../socket/socket.js";

// Fetch notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark a specific notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Utility function to create and emit notification
export const createNotification = async (userId, type, content, relatedId = null) => {
  try {
    const newNotification = await Notification.create({
      userId,
      type,
      content,
      relatedId,
    });

    try {
      const io = getIO();
      io.to(userId.toString()).emit("newNotification", newNotification);
    } catch (socketError) {
      console.log("Socket not initialized or user not connected, notification saved to DB.");
    }

    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
