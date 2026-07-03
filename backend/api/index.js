import dotenv from 'dotenv';

dotenv.config();

import { connectToDatabase } from '../config/database.js';
import app from '../index.js';
import { seedAdmin } from '../controllers/adminController.js';

let initPromise = null;

function getInitPromise() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectToDatabase();
      await seedAdmin();
    })();
  }

  return initPromise;
}

export default async function handler(req, res) {
  try {
    await getInitPromise();
    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}
