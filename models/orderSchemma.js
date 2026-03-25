// models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    variant: {
      sku: { type: String },
      option1Value: { type: String },
      option2Value: { type: String },
    },
    image: { type: String },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zip: { type: String },
    country: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: addressSchema,
    paymentMethod: { type: String, required: true }, // e.g., "COD", "Stripe", "PayPal"
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "processing",
    },
    occasion: { type: String },
    eventTime: { type: String },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    eventDate: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
