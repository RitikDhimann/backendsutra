import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    occasion: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    image: { type: String },
    bg: { type: String, default: "#ffffff" },
    rotation: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
