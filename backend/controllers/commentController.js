import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";

export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;
    const { ObjectId } = await import("mongodb");

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get author's username
    let authorUsername = "user";
    try {
      const author = await User.findById(userId);
      if (author) {
        authorUsername = author.username || author.email?.split("@")[0] || "user";
      }
    } catch (err) {
      console.error("Could not fetch author:", err.message);
    }

    const comment = await Comment.createComment({
      post_id: new ObjectId(id),
      author_id: new ObjectId(userId),
      author_username: authorUsername,
      text,
    });

    res.status(201).json({
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getPostComments(req, res) {
  try {
    const { id } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let comments = await Comment.findByPostId(
      id,
      parseInt(limit),
      parseInt(skip),
    );

    // Fetch author_username for comments that don't have it
    comments = await Promise.all(
      comments.map(async (comment) => {
        if (!comment.author_username) {
          try {
            const author = await User.findById(comment.author_id.toString());
            if (author) {
              comment.author_username = author.username || author.email?.split("@")[0] || "user";
            }
          } catch (err) {
            console.error("Could not fetch author:", err.message);
            comment.author_username = "user";
          }
        }
        return comment;
      })
    );

    res.status(200).json({ data: comments, count: comments.length });
  } catch (error) {
    console.error("Get post comments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function updateComment(req, res) {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await Comment.updateComment(commentId, text);
    if (updated) {
      const updatedComment = await Comment.findById(commentId);
      res.status(200).json({
        message: "Comment updated successfully",
        data: updatedComment,
      });
    } else {
      res.status(500).json({ message: "Failed to update comment" });
    }
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function deleteComment(req, res) {
  try {
    const { id, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deleted = await Comment.deleteComment(commentId);
    if (deleted) {
      res.status(200).json({ message: "Comment deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
