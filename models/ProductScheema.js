import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  sku: { type: String, default: null },
  inventoryQty: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  compareAtPrice: { type: Number, default: null },
  color: { type: String },
  size: { type: String },
  option1: { type: String },
  option2: { type: String },
});

const imageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  position: { type: Number, default: 1 },
});

const variantImageSchema = new mongoose.Schema({
  variant: { type: String, required: true },
  images: [imageSchema],
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    handle: { type: String, unique: true, sparse: true },
    description: { type: String },
    vendor: { type: String, default: "Surprise Sutra" },
    productCategory: { type: String },
    type: { type: String },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    giftCard: { type: Boolean, default: false },
    option1Name: { type: String, default: "Color" },
    option2Name: { type: String, default: "Size" },
    seo: { title: { type: String }, description: { type: String } },
    images: [imageSchema],
    variantImages: [variantImageSchema], // ← CHANGED
    variants: [variantSchema],
    colors: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        hex: { type: String, required: true },
        sizes: [{ type: String }],
      },
    ],
    termsAndConditions: { type: String },
    boxContents: { type: String },
    includedIndia: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);