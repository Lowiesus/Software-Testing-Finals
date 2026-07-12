import { Post, POST_CATEGORIES, POST_TYPES } from "../models/post.js";
import { Comment } from "../models/comment.js";
import { Bookmark } from "../models/bookmark.js";
import { Reblog } from "../models/reblog.js";
import { Like } from "../models/like.js";
import { Tag } from "../models/tag.js";
import { User } from "../models/user.js";
import { uploadImageFile, deleteImageByUrl } from "../utils/storage.js";
import path from "path";
import fs from "fs";

async function rotateImage(fullPath) {
  try {
    const sharp = (await import("sharp")).default;
    await sharp(fullPath).rotate().toFile(`${fullPath}.tmp`);
    fs.renameSync(`${fullPath}.tmp`, fullPath);
  } catch (err) {
    console.error("Error processing image with sharp:", err.message);
  }
}

async function processPostImage(file) {
  const { getPostUploadDir } = await import("../utils/uploadPaths.js");
  const fullPath = path.join(getPostUploadDir(), file.filename);

  await rotateImage(fullPath);

  try {
    const publicUrl = await uploadImageFile(file, "posts");
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    return publicUrl;
  } catch (storageError) {
    console.error("Supabase storage upload failed, using local path:", storageError.message);
    return `/uploads/posts/${file.filename}`;
  }
}

export async function createPost(req, res) {
  try {
    console.log("POST REQUEST RECEIVED");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    console.log("req.user:", req.user);
    
    const { caption, category, post_type, tags } = req.body;
    const authorId = req.user?.id;

    // Validate required fields
    if (!authorId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!caption || !category) {
      return res.status(400).json({
        message: "Caption and category are required",
      });
    }

    // Validate category
    if (!Object.values(POST_CATEGORIES).includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed: ${Object.values(POST_CATEGORIES).join(", ")}`,
      });
    }

    // Validate post type if provided
    if (post_type && !Object.values(POST_TYPES).includes(post_type)) {
      return res.status(400).json({
        message: `Invalid post type. Allowed: ${Object.values(POST_TYPES).join(", ")}`,
      });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = await processPostImage(req.file);
      console.log("Image path set to:", imagePath);
    }

    if (!imagePath) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Parse tags if it's a string
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === "string" ? tags.split(",") : tags;
      parsedTags = parsedTags.map((tag) => tag.trim()).filter((tag) => tag);
    }

    // Get author's username and profile picture
    let authorUsername = "user";
    let authorProfilePicture = null;
    try {
      const author = await User.findById(authorId);
      console.log("Author data retrieved:", {
        id: author?._id,
        username: author?.username,
        email: author?.email,
        profilePicture: author?.profilePicture,
      });
      
      if (author) {
        // Use username if available, otherwise use email, otherwise "user"
        authorUsername = author.username || author.email?.split("@")[0] || "user";
        authorProfilePicture = author.profilePicture || null;
        console.log("Final authorUsername:", authorUsername);
        console.log("Final authorProfilePicture:", authorProfilePicture);
      }
    } catch (err) {
      console.error("Could not fetch author:", err.message);
      // Continue anyway with default values
    }

    console.log("Creating post with:", {
      caption,
      imagePath,
      category,
      authorId,
      authorUsername,
      authorProfilePicture,
      tags: parsedTags,
    });

    // Create post
    const result = await Post.createPost({
      caption,
      image: imagePath,
      category,
      post_type: post_type || POST_TYPES.STANDARD,
      author_id: authorId,
      author_username: authorUsername,
      author_profilePicture: authorProfilePicture,
      tags: parsedTags,
    });

    console.log("Post created with insertedId:", result.insertedId);

    const newPost = await Post.findById(result.insertedId.toString());
    console.log("Retrieved post:", newPost);

    res.status(201).json({
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    console.error("Create post error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getPost(req, res) {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ data: post });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getPostsByType(req, res) {
  try {
    const { post_type } = req.query;

    if (!post_type) {
      return res.status(400).json({ message: "Post type is required" });
    }

    if (!Object.values(POST_TYPES).includes(post_type)) {
      return res.status(400).json({
        message: `Invalid post type. Allowed: ${Object.values(POST_TYPES).join(", ")}`,
      });
    }

    const posts = await Post.findByPostType(post_type);

    res.status(200).json({ data: posts, count: posts.length });
  } catch (error) {
    console.error("Get posts by type error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getAllPosts(req, res) {
  try {
    const { limit = 20, skip = 0, category } = req.query;

    let posts;
    if (category) {
      if (!Object.values(POST_CATEGORIES).includes(category)) {
        return res.status(400).json({
          message: `Invalid category. Allowed: ${Object.values(POST_CATEGORIES).join(", ")}`,
        });
      }
      posts = await Post.findByCategory(category);
    } else {
      posts = await Post.getAllPosts(parseInt(limit), parseInt(skip));
    }

    res.status(200).json({ data: posts, count: posts.length });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getUserPosts(req, res) {
  try {
    const { userId } = req.params;
    console.log("Getting posts for userId:", userId);
    console.log("userId type:", typeof userId);

    const posts = await Post.findByAuthorId(userId);
    
    console.log("Posts found:", posts.length);
    console.log("Posts:", posts);

    res.status(200).json({ data: posts, count: posts.length });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { caption, category, post_type, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updates = {};
    if (caption) updates.caption = caption;
    if (category) {
      if (!Object.values(POST_CATEGORIES).includes(category)) {
        return res.status(400).json({
          message: `Invalid category. Allowed: ${Object.values(POST_CATEGORIES).join(", ")}`,
        });
      }
      updates.category = category;
    }

    if (post_type) {
      if (!Object.values(POST_TYPES).includes(post_type)) {
        return res.status(400).json({
          message: `Invalid post type. Allowed: ${Object.values(POST_TYPES).join(", ")}`,
        });
      }
      updates.post_type = post_type;
    }

    if (req.file) {
      if (post.image) {
        await deleteImageByUrl(post.image);
      }
      updates.image = await processPostImage(req.file);
    }

    if (tags) {
      const parsedTags = typeof tags === "string" ? tags.split(",") : tags;
      updates.tags = parsedTags.map((tag) => tag.trim()).filter((tag) => tag);
    }

    await Post.updatePost(id, updates);
    const updatedPost = await Post.findById(id);

    res.status(200).json({
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function deletePost(req, res) {
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

    // Check if user is the author
    if (post.author_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (post.image) {
      if (post.image.startsWith("http")) {
        await deleteImageByUrl(post.image);
      } else {
        const filePath = path.join(".", post.image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Cascade delete related data
    await Comment.deleteByPostId(id);
    await Bookmark.deleteByPostId(id);
    await Reblog.deleteByPostId(id);
    await Like.deleteByPostId(id);

    // Decrement tag counts
    if (post.tags && post.tags.length > 0) {
      for (const tag of post.tags) {
        await Tag.decrementPostCount(tag);
      }
    }

    await Post.deletePost(id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Comment operations
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

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

    const comment = await Comment.createComment(id, userId, text);

    res.status(201).json({
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
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

    // Check if user is the comment author
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

    // Check if user is the comment author
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

export async function getPostComments(req, res) {
  try {
    const { id } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.findByPostId(
      id,
      parseInt(limit),
      parseInt(skip),
    );

    res.status(200).json({ data: comments, count: comments.length });
  } catch (error) {
    console.error("Get post comments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Bookmark operations
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

    res
      .status(200)
      .json({ message: "Post bookmarked successfully", data: bookmark });
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
      parseInt(skip),
    );

    // Fetch the actual post data for each bookmark
    const postIds = bookmarks.map((b) => b.post_id);
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

// Like operations
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

// Tag operations
export async function addTag(req, res) {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!tag) {
      return res.status(400).json({ message: "Tag is required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (post.tags && post.tags.includes(tag.toLowerCase())) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    // Add tag to post
    await Post.addTag(id, tag.toLowerCase());
    // Increment tag count
    await Tag.incrementPostCount(tag);
    const updatedPost = await Post.findById(id);

    res.status(200).json({
      message: "Tag added successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Add tag error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function removeTag(req, res) {
  try {
    const { id, tag } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const tagLower = tag.toLowerCase();
    if (!post.tags || !post.tags.includes(tagLower)) {
      return res.status(400).json({ message: "Tag not found" });
    }

    // Remove tag from post
    await Post.removeTag(id, tagLower);
    // Decrement tag count
    await Tag.decrementPostCount(tag);
    const updatedPost = await Post.findById(id);

    res.status(200).json({
      message: "Tag removed successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Remove tag error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getAllTags(req, res) {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const tags = await Tag.getAllTags(parseInt(limit), parseInt(skip));

    res.status(200).json({ data: tags, count: tags.length });
  } catch (error) {
    console.error("Get all tags error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function searchTags(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const tags = await Tag.searchTags(q);

    res.status(200).json({ data: tags, count: tags.length });
  } catch (error) {
    console.error("Search tags error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Search
export async function searchByCaption(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const posts = await Post.searchByCaption(q);

    res.status(200).json({ data: posts, count: posts.length });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getPostStats(req, res) {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentCount = await Comment.countByPostId(id);
    const bookmarkCount = await Bookmark.countByPostId(id);
    const likeCount = await Like.countByPostId(id);
    let reblogCount = 0;

    try {
      reblogCount = await Reblog.countByPostId(id);
    } catch (reblogError) {
      console.error("Reblog count unavailable:", reblogError.message);
    }

    const stats = {
      commentCount,
      bookmarkCount,
      likeCount,
      reblogCount,
    };

    res.status(200).json({ data: stats });
  } catch (error) {
    console.error("Get post stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getExploreTrending(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 20);
    const posts = await Post.getAllPosts(100, 0);

    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countByPostId(post._id);
        let reblogCount = 0;

        try {
          reblogCount = await Reblog.countByPostId(post._id);
        } catch (reblogError) {
          console.error("Reblog count unavailable:", reblogError.message);
        }

        return {
          ...post,
          likeCount,
          reblogCount,
        };
      }),
    );

    const mostLiked = [...postsWithStats]
      .sort((a, b) => b.likeCount - a.likeCount || b.reblogCount - a.reblogCount)
      .slice(0, limit);

    const mostReposted = [...postsWithStats]
      .sort((a, b) => b.reblogCount - a.reblogCount || b.likeCount - a.likeCount)
      .slice(0, limit);

    res.status(200).json({
      data: {
        mostLiked,
        mostReposted,
      },
    });
  } catch (error) {
    console.error("Get explore trending error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
