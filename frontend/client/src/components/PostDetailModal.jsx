import { useState, useEffect } from "react";
import "./PostDetailModal.css";
import {
  postAPI,
  commentAPI,
  bookmarkAPI,
  likeAPI,
  authAPI,
  reblogAPI,
} from "../utils/api";
import { getAssetUrl } from "../utils/constants.js";
import { clampCount, getErrorMessage } from "../utils/helpers.js";
import heartIcon from "../assets/icons/heart-unfilled.png";
import commentIcon from "../assets/icons/comments.png";
import bookmarkIcon from "../assets/icons/bookmark.png";

const PostDetailModal = ({ post, onClose }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [stats, setStats] = useState({
    likeCount: 0,
    commentCount: 0,
    bookmarkCount: 0,
    reblogCount: 0,
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReblogged, setIsReblogged] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [reblogLoading, setReblogLoading] = useState(false);

  const isAuthor =
    currentUserId &&
    post?.author_id &&
    String(currentUserId) === String(post.author_id);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await authAPI.getProfile();
        setCurrentUserId(response.data.user?._id || null);
      } catch (err) {
        console.error("Error loading current user:", err);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!post?._id) return;

    setShowComments(false);
    setComments([]);
    setNewComment("");
    fetchStats();
  }, [post?._id]);

  const normalizeStats = (data = {}) => ({
    likeCount: clampCount(data.likeCount),
    commentCount: clampCount(data.commentCount),
    bookmarkCount: clampCount(data.bookmarkCount),
    reblogCount: clampCount(data.reblogCount),
  });

  const fetchStats = async () => {
    if (!post?._id) return;

    try {
      const response = await postAPI.getPostStats(post._id);
      setStats(normalizeStats(response.data.data));

      try {
        const likeCheckResponse = await likeAPI.isPostLikedByUser(post._id);
        setIsLiked(likeCheckResponse.data.data || false);
      } catch (err) {
        console.error("Error checking like status:", err);
        setIsLiked(false);
      }

      try {
        const bookmarkCheckResponse = await bookmarkAPI.isPostBookmarkedByUser(
          post._id,
        );
        setIsBookmarked(bookmarkCheckResponse.data.data || false);
      } catch (err) {
        console.error("Error checking bookmark status:", err);
        setIsBookmarked(false);
      }

      try {
        const reblogCheckResponse = await reblogAPI.isPostRebloggedByUser(
          post._id,
        );
        setIsReblogged(reblogCheckResponse.data.data || false);
      } catch (err) {
        console.error("Error checking reblog status:", err);
        setIsReblogged(false);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLike = async () => {
    if (!post?._id) return;

    try {
      if (isLiked) {
        await likeAPI.removeLike(post._id);
        setIsLiked(false);
        setStats((prev) => ({ ...prev, likeCount: prev.likeCount - 1 }));
      } else {
        await likeAPI.addLike(post._id);
        setIsLiked(true);
        setStats((prev) => ({ ...prev, likeCount: prev.likeCount + 1 }));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleBookmark = async () => {
    if (!post?._id || bookmarkLoading) return;

    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await bookmarkAPI.removeBookmark(post._id);
        setIsBookmarked(false);
      } else {
        await bookmarkAPI.addBookmark(post._id);
        setIsBookmarked(true);
      }
      await fetchStats();
    } catch (error) {
      console.error("Error bookmarking post:", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleReblog = async () => {
    if (!post?._id || reblogLoading || isAuthor) return;

    setReblogLoading(true);
    try {
      if (isReblogged) {
        await reblogAPI.removeReblog(post._id);
        setIsReblogged(false);
      } else {
        await reblogAPI.addReblog(post._id);
        setIsReblogged(true);
      }
      await fetchStats();
    } catch (error) {
      console.error("Error reblogging post:", error);
      alert(getErrorMessage(error, "Failed to reblog post"));
    } finally {
      setReblogLoading(false);
    }
  };

  const loadComments = async () => {
    if (!post?._id) return;

    try {
      const response = await commentAPI.getComments(post._id);
      setComments(response.data.data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      alert(getErrorMessage(error, "Failed to load comments"));
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
    if (!post?._id || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentAPI.addComment(post._id, newComment);
      setNewComment("");
      setStats((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
      loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(getErrorMessage(error, "Failed to add comment"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!post?._id) return;

    try {
      await commentAPI.deleteComment(post._id, commentId);
      setStats((prev) => ({ ...prev, commentCount: prev.commentCount - 1 }));
      loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (!post) return null;

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div
        className="post-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="post-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="post-modal-header">
          <div className="post-modal-avatar">
            {post.author_profilePicture && (
              <img
                src={getAssetUrl(post.author_profilePicture)}
                alt={post.author_username}
              />
            )}
          </div>
          <div>
            <div className="post-modal-username">@{post.author_username}</div>
            <div className="post-modal-time">{post.category || "Post"}</div>
          </div>
        </div>

        {post.image && (
          <div className="post-modal-image">
            <img
              src={getAssetUrl(post.image)}
              alt={post.caption || "Post"}
            />
          </div>
        )}

        {post.caption && (
          <p className="post-modal-caption">{post.caption}</p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="post-modal-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="post-modal-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="post-modal-stats">
          <button
            type="button"
            className={`post-modal-stat ${isLiked ? "active" : ""}`}
            onClick={handleLike}
            title="Like"
          >
            <img src={heartIcon} alt="Like" />
            {stats.likeCount}
          </button>
          <button
            type="button"
            className={`post-modal-stat ${showComments ? "active" : ""}`}
            onClick={toggleComments}
            title="Comment"
          >
            <img src={commentIcon} alt="Comment" />
            {stats.commentCount}
          </button>
          <button
            type="button"
            className={`post-modal-stat ${isReblogged ? "active" : ""}`}
            onClick={handleReblog}
            title={isAuthor ? "Cannot reblog your own post" : "Reblog"}
            disabled={isAuthor || reblogLoading}
          >
            <span className="reblog-stat-icon">↻</span>
            {clampCount(stats.reblogCount)}
          </button>
          <button
            type="button"
            className={`post-modal-stat ${isBookmarked ? "active" : ""}`}
            onClick={handleBookmark}
            title="Bookmark"
            disabled={bookmarkLoading}
          >
            <img src={bookmarkIcon} alt="Bookmark" />
            {clampCount(stats.bookmarkCount)}
          </button>
        </div>

        {showComments && (
          <div className="post-modal-comments">
            <form onSubmit={handleAddComment} className="post-modal-comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                disabled={submitting}
              />
              <button type="submit" disabled={submitting}>
                {submitting ? "..." : "Post"}
              </button>
            </form>

            <div className="post-modal-comments-list">
              {comments.length === 0 ? (
                <p className="post-modal-no-comments">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="post-modal-comment-item">
                    <div className="post-modal-comment-header">
                      <strong className="post-modal-comment-author">
                        @{comment.author_username}
                      </strong>
                      <small className="post-modal-comment-date">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="post-modal-comment-text">{comment.text}</p>
                    {currentUserId &&
                      String(comment.author_id) === String(currentUserId) && (
                        <button
                          type="button"
                          className="post-modal-delete-btn"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          Delete
                        </button>
                      )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailModal;
