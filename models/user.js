// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String },
    zip: { type: String },
    country: { type: String, required: false },
    isDefault: { type: Boolean, default: false }, // optional, mark default address
  },
  { _id: false } // prevents creating separate _id for each address
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
     addresses: {
      type: [addressSchema],
      default: [],
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
