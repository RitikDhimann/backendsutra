import mongoose from "mongoose";

const QuerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    occasion: {
      type: String,
    },
    date: {
      type: Date,
    },
    location: {
      type: String,
    },
    message: {
      type: String,
      required: [true, "Please provide a message/vision"],
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Query", QuerySchema);
