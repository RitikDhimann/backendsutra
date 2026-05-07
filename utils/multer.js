import multer from "multer";
import path from "path";
import fs from "fs";

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(process.cwd(), "uploads", "general");

    if (file.fieldname === "general") {
      uploadPath = path.join(process.cwd(), "uploads", "general");
    } else if (file.fieldname.startsWith("variant-")) {
      const variantKey = file.fieldname.split("variant-")[1];
      uploadPath = path.join(process.cwd(), "uploads", "variants", variantKey);
    } else if (file.fieldname === "banner") {
      uploadPath = path.join(process.cwd(), "uploads", "banners");
    } else if (file.fieldname === "image") {
      uploadPath = path.join(process.cwd(), "uploads", "reviews");
    }

    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const upload1 = multer({ storage });