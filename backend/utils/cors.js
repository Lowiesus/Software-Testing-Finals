export function parseOrigins(value) {
  if (!value) return [];
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export function isAllowedOrigin(origin) {
  if (!origin) return true;

  const allowedOrigins = [
    ...parseOrigins(process.env.CORS_ORIGIN),
    ...parseOrigins(process.env.CORS_ORIGINS),
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (allowedOrigins.includes(origin)) return true;

  const vercelPrefix = process.env.CORS_VERCEL_PREFIX || 'software-testing-finals';
  return (
    origin.startsWith(`https://${vercelPrefix}`) && origin.endsWith('.vercel.app')
  );
}

export function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
}

export function handlePreflight(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}
