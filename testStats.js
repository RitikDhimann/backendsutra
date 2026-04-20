import dotenv from "dotenv";
import mongoose from "mongoose";
import Order from "./models/orderSchemma.js";
import Product from "./models/ProductScheema.js";
import User from "./models/user.js";

dotenv.config();

const testStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        console.log("Counting orders...");
        const totalOrders = await Order.countDocuments();
        console.log("Total Orders:", totalOrders);

        console.log("Aggregating revenue...");
        const revenueResult = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        console.log("Total Revenue:", totalRevenue);

        console.log("Counting customers...");
        const newCustomers = await User.countDocuments();
        console.log("New Customers:", newCustomers);

        console.log("Counting products...");
        const totalProducts = await Product.countDocuments();
        console.log("Total Products:", totalProducts);

        console.log("Counting out of stock...");
        const outOfStock = await Product.countDocuments({ "variants.inventoryQty": 0 });
        console.log("Out of stock:", outOfStock);

        console.log("Fetching recent orders...");
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email");
        console.log("Recent Orders count:", recentOrders.length);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Test Error:", error);
        process.exit(1);
    }
};

testStats();
