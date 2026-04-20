import express from "express";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { upload1 } from "../utils/multer.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", upload1.single('image'), createReview);
router.patch("/:id", upload1.single('image'), updateReview);
router.delete("/:id", deleteReview);

export default router;
