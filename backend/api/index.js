import dotenv from 'dotenv';

dotenv.config();

import { connectToDatabase } from '../config/database.js';
import app from '../index.js';
import { seedAdmin } from '../controllers/adminController.js';

export const config = {
  maxDuration: 30,
};

let initPromise = null;
let initError = null;

function getInitPromise() {
  if (initError) {
    return Promise.reject(initError);
  }

  if (!initPromise) {
    initPromise = (async () => {
      await connectToDatabase();
      await seedAdmin();
    })().catch((error) => {
      initError = error;
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

function getHealthStatus() {
  return {
    message: 'ok',
    runtime: process.env.VERCEL ? 'vercel' : 'local',
    configured: {
      supabaseUrl: Boolean(process.env.SUPABASE_URL),
      supabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      jwtSecret: Boolean(process.env.JWT_SECRET),
      jwtRefreshSecret: Boolean(process.env.JWT_REFRESH_SECRET),
      adminEmail: Boolean(process.env.ADMIN_EMAIL),
      adminPassword: Boolean(process.env.ADMIN_PASSWORD),
      corsOrigin: Boolean(process.env.CORS_ORIGIN),
    },
  };
}

export default async function handler(req, res) {
  const path = (req.url || '').split('?')[0];

  if (path === '/ping') {
    return res.status(200).json({ message: 'pong' });
  }

  if (path === '/health') {
    const health = getHealthStatus();
    const ready = health.configured.supabaseUrl && health.configured.supabaseServiceKey;
    return res.status(ready ? 200 : 503).json(health);
  }

  try {
    await getInitPromise();
    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);

    if (!res.headersSent) {
      return res.status(503).json({
        success: false,
        message: error.message || 'Server initialization failed',
        hint: 'Check backend environment variables on Vercel (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGIN).',
      });
    }
  }
}
