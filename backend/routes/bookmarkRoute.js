import express from "express";
import * as bookmarkController from "../controllers/bookmarkController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add bookmark to post
router.post("/posts/:id/bookmarks", authenticateToken, bookmarkController.addBookmark);

// Remove bookmark from post
router.delete("/posts/:id/bookmarks", authenticateToken, bookmarkController.removeBookmark);

// Get all bookmarked posts for current user
router.get("/bookmarks", authenticateToken, bookmarkController.getBookmarkedPosts);

// Get all bookmarks for a specific user
router.get("/users/:userId/bookmarks", bookmarkController.getUserBookmarks);

// Check if post is bookmarked by current user
router.get("/posts/:id/bookmarks/check", authenticateToken, bookmarkController.isPostBookmarkedByUser);

export default router;
