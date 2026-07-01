import express from "express";
import * as adminController from "../controllers/adminController.js";
import {
  authenticateToken,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only routes

router.post("/", authenticateToken, requireAdmin, adminController.createAdmin);
router.get("/", authenticateToken, requireAdmin, adminController.getAllAdmins); //Might remove later on as in production this typically isn't allowed.
router.get(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  adminController.getUserById,
);

// User management routes
router.get("/users", authenticateToken, requireAdmin, adminController.getAllUsers);
router.patch(
  "/users/:id/status",
  authenticateToken,
  requireAdmin,
  adminController.updateUserStatus
);
router.patch(
  "/users/:id/verify",
  authenticateToken,
  requireAdmin,
  adminController.verifyUser
);
router.patch(
  "/users/:id/ban",
  authenticateToken,
  requireAdmin,
  adminController.banUser
);
router.patch(
  "/users/:id/unban",
  authenticateToken,
  requireAdmin,
  adminController.unbanUser
);

export default router;
