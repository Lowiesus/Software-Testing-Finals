import jwt from "jsonwebtoken";

// Verifies access token in Authorization header
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // 401 for expired or invalid token
      return res.status(401).json({ error: "Invalid or expired access token" });
    }
    req.user = user;
    next();
  });
};

// Role-based middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
