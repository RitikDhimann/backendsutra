import express from "express";
import multer from "multer";
import {
  getProducts,
  addProduct,
  uploadExcel,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
} from "../controllers/product.js";
import { upload1 } from "../utils/multer.js";

const router = express.Router();

// Multer setup for Excel uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // CSV
      "application/csv",
      "text/x-csv",
      "application/x-csv",
      "text/comma-separated-values",
      "text/x-comma-separated-values",
      "application/octet-stream", // sometimes CSV or Excel is detected like this
      "application/vnd.ms-excel.sheet.macroEnabled.12"
    ];

    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      console.log("Rejected file MIME:", file.mimetype);
      cb(new Error("Only Excel or CSV files are allowed"), false);
    }
  },
});



// Routes
router.get("/", getProducts);
router.get('/all', getAllProducts)
router.get('/:id', getProductById)
router.post("/", upload1.any(), addProduct);
router.post("/upload", upload.single("file"), uploadExcel);
router.put("/:id", upload1.any(), updateProduct);
router.delete("/:id", deleteProduct);



export default router;
