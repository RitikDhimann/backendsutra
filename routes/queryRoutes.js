import express from "express";
import {
  getQueries,
  createQuery,
  updateQueryStatus,
  deleteQuery,
} from "../controllers/queryController.js";

const router = express.Router();

router.get("/", getQueries);
router.post("/", createQuery);
router.patch("/:id", updateQueryStatus);
router.delete("/:id", deleteQuery);

export default router;
