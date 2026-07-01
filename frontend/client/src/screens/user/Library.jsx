import { useState, useEffect } from "react";
import { bookmarkAPI, postAPI, likeAPI, commentAPI } from "../../utils/api";
import heartIcon from "../../assets/icons/heart-unfilled.png";
import commentIcon from "../../assets/icons/comments.png";
import bookmarkIcon from "../../assets/icons/bookmark.png";
import threeDotsIcon from "../../assets/icons/three-dots.png";

const UserLibrary = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookmarkedPosts();
  }, []);

  const fetchBookmarkedPosts = async () => {
    setLoading(true);
    try {
      const response = await bookmarkAPI.getBookmarkedPosts(20, 0);
      setBookmarkedPosts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "60px 20px",
        width: "100%",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "800px" }}>
        {/* Title */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "24px",
          }}
        >
          Your Library
        </h1>

        {/* Content */}
        {loading ? (
          <div style={{ color: "#6b7280", fontSize: "15px" }}>
            Loading bookmarks...
          </div>
        ) : bookmarkedPosts.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: "15px" }}>
            <p>No bookmarks yet.</p>
          </div>
        ) : (
          <div>
            {bookmarkedPosts.map((post) => (
              <BookmarkItem
                key={post._id}
                post={post}
                onBookmarkRemove={fetchBookmarkedPosts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Bookmark Item Component
const BookmarkItem = ({ post, onBookmarkRemove }) => {
  const [stats, setStats] = useState({
    likeCount: 0,
    commentCount: 0,
    bookmarkCount: 0,
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [post._id]);

  const fetchStats = async () => {
    try {
      const response = await postAPI.getPostStats(post._id);
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleRemoveBookmark = async () => {
    try {
      await bookmarkAPI.removeBookmark(post._id);
      setIsBookmarked(false);
      setStats((prev) => ({
        ...prev,
        bookmarkCount: prev.bookmarkCount - 1,
      }));
      onBookmarkRemove();
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const loadComments = async () => {
    try {
      console.log("Loading comments for post:", post._id);
      const response = await commentAPI.getComments(post._id);
      console.log("Comments response:", response.data);
      setComments(response.data.data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      alert("Failed to load comments: " + error.message);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert("Please write a comment");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting comment:", newComment);
      await commentAPI.addComment(post._id, newComment);
      console.log("Comment added successfully");
      setNewComment("");
      setStats((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
      loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      console.log("Deleting comment:", commentId);
      await commentAPI.deleteComment(post._id, commentId);
      setStats((prev) => ({ ...prev, commentCount: prev.commentCount - 1 }));
      loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment: " + error.message);
    }
  };

  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid #e1e8ed",
        borderRadius: "8px",
        marginBottom: "12px",
        backgroundColor: "#f7f9fa",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontWeight: "700", color: "#0f1419" }}>
          @{post.author_username || "user"}
        </div>
        <button
          onClick={handleRemoveBookmark}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            color: "#536471",
          }}
        >
          ✕
        </button>
      </div>

      {post.image && (
        <div
          style={{
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "#e1e8ed",
            margin: "12px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={`http://localhost:3000${post.image}`}
            alt="Post"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "400px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      )}

      <p
        style={{
          color: "#0f1419",
          fontSize: "15px",
          lineHeight: "20px",
          margin: "12px 0",
        }}
      >
        {post.caption}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            margin: "12px 0",
          }}
        >
          {post.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "13px",
                color: "#7c3aed",
                backgroundColor: "#f3e8ff",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "24px",
          marginTop: "12px",
          color: "#536471",
          fontSize: "13px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src={heartIcon}
            alt="Like"
            style={{ width: "18px", height: "18px" }}
          />
          {stats.likeCount}
        </span>
        <span
          onClick={toggleComments}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <img
            src={commentIcon}
            alt="Comment"
            style={{ width: "18px", height: "18px" }}
          />
          {stats.commentCount}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#7c3aed",
          }}
        >
          <img
            src={bookmarkIcon}
            alt="Bookmark"
            style={{ width: "18px", height: "18px" }}
          />
          {stats.bookmarkCount}
        </span>
      </div>

      {showComments && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #e1e8ed",
          }}
        >
          <form
            onSubmit={handleAddComment}
            style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={submitting}
              style={{
                color: "black",
                flex: 1,
                border: "1px solid #e1e8ed",
                borderRadius: "20px",
                padding: "10px 16px",
                fontSize: "14px",
                fontFamily: "inherit",
                backgroundColor: "#f7f9fa",
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: "#7c3aed",
                color: "white",
                border: "none",
                padding: "8px 20px",
                borderRadius: "20px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {submitting ? "..." : "Post"}
            </button>
          </form>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {comments.length === 0 ? (
              <p
                style={{
                  color: "#536471",
                  fontSize: "13px",
                  textAlign: "center",
                  margin: "12px 0",
                }}
              >
                No comments yet
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  style={{
                    paddingBottom: "12px",
                    borderBottom: "1px solid #e1e8ed",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      color: "#0f1419",
                      fontSize: "14px",
                    }}
                  >
                    {comment.text}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "#536471",
                      fontSize: "12px",
                    }}
                  >
                    <span>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e74c3c",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLibrary;
