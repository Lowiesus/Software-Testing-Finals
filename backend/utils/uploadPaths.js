import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = Boolean(process.env.VERCEL);

const baseUploadDir = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(path.resolve(__dirname, '..'), 'uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getPostUploadDir() {
  const dir = path.join(baseUploadDir, 'posts');
  ensureDir(dir);
  return dir;
}

export function getProfileUploadDir() {
  const dir = path.join(baseUploadDir, 'profiles');
  ensureDir(dir);
  return dir;
}

export function getUploadBaseDir() {
  ensureDir(baseUploadDir);
  return baseUploadDir;
}

export const isServerlessUploads = isVercel;
