import express from "express";
import * as likeController from "../controllers/likeController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add like to post
router.post("/posts/:id/likes", authenticateToken, likeController.addLike);

// Remove like from post
router.delete("/posts/:id/likes", authenticateToken, likeController.removeLike);

// Get all likes for a post
router.get("/posts/:id/likes", likeController.getPostLikes);

// Get all likes by a user
router.get("/users/:userId/likes", likeController.getUserLikes);

// Check if post is liked by current user
router.get("/posts/:id/likes/check", authenticateToken, likeController.isPostLikedByUser);

export default router;
