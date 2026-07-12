import express from "express";
import * as reblogController from "../controllers/reblogController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/posts/:id/reblogs", authenticateToken, reblogController.addReblog);
router.delete("/posts/:id/reblogs", authenticateToken, reblogController.removeReblog);
router.get("/reblogs", authenticateToken, reblogController.getRebloggedPosts);
router.get("/users/:userId/reblogs", reblogController.getUserRebloggedPosts);
router.get("/posts/:id/reblogs/check", authenticateToken, reblogController.isPostRebloggedByUser);

export default router;
