import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: "#000000",
    },
    textColor: {
      type: String,
      default: "#ffffff",
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
