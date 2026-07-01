import { Bookmark } from "../models/bookmark.js";
import { Post } from "../models/post.js";

export async function addBookmark(req, res) {
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

    const isBookmarked = await Bookmark.isBookmarkedByUser(id, userId);
    if (isBookmarked) {
      return res.status(400).json({ message: "Post already bookmarked" });
    }

    const bookmark = await Bookmark.createBookmark(id, userId);

    res.status(200).json({ message: "Post bookmarked successfully", data: bookmark });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function removeBookmark(req, res) {
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

    const isBookmarked = await Bookmark.isBookmarkedByUser(id, userId);
    if (!isBookmarked) {
      return res.status(400).json({ message: "Post not bookmarked" });
    }

    const deleted = await Bookmark.deleteByPostAndUser(id, userId);
    if (deleted) {
      res.status(200).json({ message: "Bookmark removed successfully" });
    } else {
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getBookmarkedPosts(req, res) {
  try {
    const userId = req.user?.id;
    const { limit = 20, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const bookmarks = await Bookmark.findByUserId(
      userId,
      parseInt(limit),
      parseInt(skip)
    );

    const postIds = bookmarks.map(b => b.post_id);
    const posts = [];
    for (const postId of postIds) {
      const post = await Post.findById(postId.toString());
      if (post) posts.push(post);
    }

    res.status(200).json({ data: posts, count: posts.length });
  } catch (error) {
    console.error("Get bookmarked posts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getUserBookmarks(req, res) {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const bookmarks = await Bookmark.findByUserId(
      userId,
      parseInt(limit),
      parseInt(skip)
    );

    const bookmarkCount = await Bookmark.countByUserId(userId);

    res.status(200).json({ 
      data: bookmarks, 
      count: bookmarks.length,
      total: bookmarkCount 
    });
  } catch (error) {
    console.error("Get user bookmarks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function isPostBookmarkedByUser(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const isBookmarked = await Bookmark.isBookmarkedByUser(id, userId);

    res.status(200).json({ data: isBookmarked });
  } catch (error) {
    console.error("Check bookmark error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
