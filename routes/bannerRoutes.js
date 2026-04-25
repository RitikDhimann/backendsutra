import express from "express";
import {
  getAllBanners,
  getActiveBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
} from "../controllers/bannerController.js";
import { upload1 } from "../utils/multer.js";

const router = express.Router();

router.get("/", getAllBanners);
router.get("/active", getActiveBanner);
router.post("/", upload1.single('image'), createBanner);
router.patch("/:id", upload1.single('image'), updateBanner);
router.patch("/:id/toggle", toggleBannerActive);
router.delete("/:id", deleteBanner);

export default router;
