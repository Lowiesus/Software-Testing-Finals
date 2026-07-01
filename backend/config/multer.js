import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directories exist
const POST_UPLOAD_DIR = "./uploads/posts";
const PROFILE_UPLOAD_DIR = "./uploads/profiles";

if (!fs.existsSync(POST_UPLOAD_DIR)) {
  fs.mkdirSync(POST_UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(PROFILE_UPLOAD_DIR)) {
  fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
}

// Post image storage
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, POST_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Profile picture storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILE_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed."));
  }
};

const uploadPost = multer({
  storage: postStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { uploadPost, uploadProfile };
export default uploadPost;
