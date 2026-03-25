import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.js";

const router = express.Router();

// ✅ CRUD Routes
router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
