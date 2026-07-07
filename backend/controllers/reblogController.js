import { Reblog } from "../models/reblog.js";
import { Post } from "../models/post.js";
import { isMissingTableError } from "../utils/supabaseHelpers.js";

function handleReblogRouteError(res, error, action) {
  console.error(`${action} error:`, error);

  if (isMissingTableError(error, "reblogs")) {
    return res.status(503).json({
      message:
        "Reblogs are not enabled in the database yet. Run backend/supabase/migrations.sql in the Supabase SQL Editor.",
    });
  }

  if (error.code === "23505") {
    return res.status(400).json({ message: "Post already reblogged" });
  }

  if (error.code === "23503") {
    return res.status(400).json({ message: "Invalid post or user for reblog" });
  }

  return res.status(500).json({ message: "Server error", error: error.message });
}

export async function addReblog(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author_id && String(post.author_id) === String(userId)) {
      return res.status(400).json({ message: "You cannot reblog your own post" });
    }

    const alreadyReblogged = await Reblog.isRebloggedByUser(id, userId);
    if (alreadyReblogged) {
      return res.status(400).json({ message: "Post already reblogged" });
    }

    const reblog = await Reblog.createReblog(id, userId);

    res.status(200).json({ message: "Post reblogged successfully", data: reblog });
  } catch (error) {
    return handleReblogRouteError(res, error, "Add reblog");
  }
}

export async function removeReblog(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const isReblogged = await Reblog.isRebloggedByUser(id, userId);
    if (!isReblogged) {
      return res.status(400).json({ message: "Post not reblogged" });
    }

    await Reblog.deleteByPostAndUser(id, userId);
    res.status(200).json({ message: "Reblog removed successfully" });
  } catch (error) {
    return handleReblogRouteError(res, error, "Remove reblog");
  }
}

export async function getRebloggedPosts(req, res) {
  try {
    const userId = req.user?.id;
    const { limit = 20, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const reblogs = await Reblog.findByUserId(userId, parseInt(limit, 10), parseInt(skip, 10));
    const posts = [];

    for (const reblog of reblogs) {
      const post = await Post.findById(reblog.post_id.toString());
      if (post) posts.push(post);
    }

    res.status(200).json({ data: posts, count: posts.length });
  } catch (error) {
    return handleReblogRouteError(res, error, "Get reblogged posts");
  }
}

export async function isPostRebloggedByUser(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const isReblogged = await Reblog.isRebloggedByUser(id, userId);
    res.status(200).json({ data: isReblogged });
  } catch (error) {
    return handleReblogRouteError(res, error, "Check reblog");
  }
}
