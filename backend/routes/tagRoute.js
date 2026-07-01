import express from "express";
import * as tagController from "../controllers/tagController.js";

const router = express.Router();

// Get all tags
router.get("/tags", tagController.getAllTags);

// Search tags
router.get("/tags/search", tagController.searchTags);

export default router;
