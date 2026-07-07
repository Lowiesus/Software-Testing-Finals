import dotenv from 'dotenv';

dotenv.config();

import { applyCorsHeaders, handlePreflight } from '../utils/cors.js';

let initPromise = null;
let initError = null;
let appInstance = null;

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

async function getApp() {
  if (appInstance) return appInstance;

  if (initError) {
    throw initError;
  }

  if (!initPromise) {
    initPromise = (async () => {
      const { connectToDatabase } = await import('../config/database.js');
      const { seedAdmin } = await import('../controllers/adminController.js');
      const { default: app } = await import('../index.js');

      await connectToDatabase();
      await seedAdmin();
      appInstance = app;
      return app;
    })().catch((error) => {
      initError = error;
      initPromise = null;
      throw error;
    });
  }

  await initPromise;
  return appInstance;
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (handlePreflight(req, res)) {
    return;
  }

  const path = (req.url || '').split('?')[0];

  if (path === '/ping') {
    return sendJson(res, 200, { message: 'pong' });
  }

  if (path === '/health') {
    const health = getHealthStatus();
    const ready = health.configured.supabaseUrl && health.configured.supabaseServiceKey;
    return sendJson(res, ready ? 200 : 503, health);
  }

  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);

    if (!res.headersSent) {
      return sendJson(res, 503, {
        success: false,
        message: error.message || 'Server initialization failed',
        hint: 'Check backend environment variables on Vercel (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGIN).',
      });
    }
  }
}
