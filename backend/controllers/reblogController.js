import { Reblog } from "../models/reblog.js";
import { Post } from "../models/post.js";

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

    if (post.author_id.toString() === userId) {
      return res.status(400).json({ message: "You cannot reblog your own post" });
    }

    const alreadyReblogged = await Reblog.isRebloggedByUser(id, userId);
    if (alreadyReblogged) {
      return res.status(400).json({ message: "Post already reblogged" });
    }

    const reblog = await Reblog.createReblog(id, userId);

    res.status(200).json({ message: "Post reblogged successfully", data: reblog });
  } catch (error) {
    console.error("Add reblog error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    console.error("Remove reblog error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    console.error("Get reblogged posts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    console.error("Check reblog error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
