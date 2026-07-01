import { Like } from "../models/like.js";
import { Post } from "../models/post.js";

export async function addLike(req, res) {
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

    const isLiked = await Like.isLikedByUser(id, userId);
    if (isLiked) {
      return res.status(400).json({ message: "Post already liked" });
    }

    const like = await Like.createLike(id, userId);

    res.status(200).json({ message: "Post liked successfully", data: like });
  } catch (error) {
    console.error("Add like error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function removeLike(req, res) {
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

    const isLiked = await Like.isLikedByUser(id, userId);
    if (!isLiked) {
      return res.status(400).json({ message: "Post not liked" });
    }

    const deleted = await Like.deleteByPostAndUser(id, userId);
    if (deleted) {
      res.status(200).json({ message: "Like removed successfully" });
    } else {
      res.status(500).json({ message: "Failed to remove like" });
    }
  } catch (error) {
    console.error("Remove like error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getPostLikes(req, res) {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likes = await Like.findByPostId(id);
    const likeCount = await Like.countByPostId(id);

    res.status(200).json({ 
      data: likes, 
      count: likes.length,
      total: likeCount 
    });
  } catch (error) {
    console.error("Get post likes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getUserLikes(req, res) {
  try {
    const { userId } = req.params;

    const likes = await Like.findByUserId(userId);
    const likeCount = await Like.countByUserId(userId);

    res.status(200).json({ 
      data: likes, 
      count: likes.length,
      total: likeCount 
    });
  } catch (error) {
    console.error("Get user likes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function isPostLikedByUser(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const isLiked = await Like.isLikedByUser(id, userId);

    res.status(200).json({ data: isLiked });
  } catch (error) {
    console.error("Check like error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
