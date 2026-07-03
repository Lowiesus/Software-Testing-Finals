import multer from 'multer';
import path from 'path';
import { getPostUploadDir, getProfileUploadDir } from '../utils/uploadPaths.js';

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
  }
};

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getPostUploadDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getProfileUploadDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadPost = multer({
  storage: postStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export { uploadPost, uploadProfile };
export default uploadPost;
