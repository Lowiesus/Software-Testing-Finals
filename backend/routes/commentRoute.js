import express from "express";
import * as commentController from "../controllers/commentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add comment to post
router.post("/posts/:id/comments", authenticateToken, commentController.addComment);

// Get all comments for a post
router.get("/posts/:id/comments", commentController.getPostComments);

// Update a comment
router.patch("/posts/:id/comments/:commentId", authenticateToken, commentController.updateComment);

// Delete a comment
router.delete("/posts/:id/comments/:commentId", authenticateToken, commentController.deleteComment);

export default router;
