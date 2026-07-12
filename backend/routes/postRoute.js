import express from "express";
import * as postController from "../controllers/postController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { uploadPost } from "../config/multer.js";

const router = express.Router();

// Create a new post
router.post(
  "/posts",
  authenticateToken,
  uploadPost.single("image"),
  postController.createPost,
);

// Get all posts
router.get("/posts", postController.getAllPosts);

// Get posts by type (must come before /:id to avoid route conflicts)
router.get("/posts/type/:post_type", postController.getPostsByType);

// Search posts by caption (must come before /:id to avoid route conflicts)
router.get("/posts/search/caption", postController.searchByCaption);

// Search posts by tag (must come before /:id to avoid route conflicts)
router.get("/posts/search/tag", postController.searchByTag);

// Explore trending posts (must come before /:id to avoid route conflicts)
router.get("/posts/explore/trending", postController.getExploreTrending);

// Get a specific post
router.get("/posts/:id", postController.getPost);

// Get posts by user
router.get("/users/:userId/posts", postController.getUserPosts);

// Update a post
router.patch(
  "/posts/:id",
  authenticateToken,
  uploadPost.single("image"),
  postController.updatePost,
);

// Delete a post
router.delete("/posts/:id", authenticateToken, postController.deletePost);

// Get post stats
router.get("/posts/:id/stats", postController.getPostStats);

// Tag operations
router.post("/posts/:id/tags", authenticateToken, postController.addTag);
router.delete(
  "/posts/:id/tags/:tag",
  authenticateToken,
  postController.removeTag,
);

export default router;
