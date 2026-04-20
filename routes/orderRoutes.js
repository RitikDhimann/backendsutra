import express from "express";
import {
  createOrder,
  getOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  sendOrderReminder,
  sendOrderStatusEmail,
  deleteOrder,
  getDashboardStats,
  getNotificationStats,
} from "../controllers/orders.js";

const router = express.Router();

// Routes
router.post("/", createOrder); // Create new order
router.get("/", getOrders); // Get all orders (admin)
router.get("/stats", getDashboardStats); // Get dashboard statistics
router.get("/notifications", getNotificationStats); // Get notification counts
router.get("/user/:userId", getUserOrders); // Get orders of a single user
router.get("/:id", getOrderById); // Get order by ID
router.patch("/:id/status", updateOrderStatus); // Update order status
router.post("/:id/status-email", sendOrderStatusEmail); // Send status email notification
router.post("/:id/reminder", sendOrderReminder); // Send manual WhatsApp reminder
router.delete("/:id", deleteOrder); // Delete order

export default router;
