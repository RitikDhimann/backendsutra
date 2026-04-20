import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import queryRoutes from './routes/queryRoutes.js'

import { initScheduler } from "./utils/scheduler.js";

// Verify Environment Variables
console.log("📧 Email User:", process.env.EMAIL_USER ? "✅ Configured" : "❌ Not Found");
console.log("🔑 Email Pass:", process.env.EMAIL_PASS ? "✅ Configured" : "❌ Not Found");

const app = express();

// Initialize scheduler
initScheduler();


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/products", productRoutes);
app.use('/api/user', userRoutes)
app.use('/api/order', orderRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/queries', queryRoutes);


// DB Connection

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("MongoDB Error:", err));

// Start Server

const PORT = process.env.PORT || 3043;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));