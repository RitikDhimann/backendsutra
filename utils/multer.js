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
    let uploadPath = "uploads/general";

    if (file.fieldname === "general") {
      uploadPath = "uploads/general";
    } else if (file.fieldname.startsWith("variant-")) {
      const variantKey = file.fieldname.split("variant-")[1];
      uploadPath = `uploads/variants/${variantKey}`;
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