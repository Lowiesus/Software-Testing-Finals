import dotenv from 'dotenv';

dotenv.config();

import { connectToDatabase } from '../config/database.js';
import app from '../index.js';
import { seedAdmin } from '../controllers/adminController.js';

let initialized = false;

async function ensureInitialized() {
  if (initialized) return;

  await connectToDatabase();
  await seedAdmin();
  initialized = true;
}

export default async function handler(req, res) {
  await ensureInitialized();
  return app(req, res);
}
