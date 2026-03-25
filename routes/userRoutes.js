// routes/userRoutes.js
import express from "express";
import { 
  registerUser, 
  loginUser, 
  updateUser, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  getUserById,
  checkEmail,
  resetPassword,
  toggleWishlist,
  getWishlist
} from "../controllers/user.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/:id', getUserById)
router.put("/:id", updateUser);
router.post("/check-email", checkEmail);
router.post("/reset-password", resetPassword);
router.post("/:id/address", addAddress);
router.put("/:id/address", updateAddress);
router.delete("/:id/address", deleteAddress);
router.post("/wishlist/toggle", toggleWishlist);
router.get("/:id/wishlist", getWishlist);

export default router;
