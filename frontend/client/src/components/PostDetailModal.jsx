import "./PostDetailModal.css";
import { getAssetUrl } from "../utils/constants.js";
import heartIcon from "../assets/icons/heart-unfilled.png";
import commentIcon from "../assets/icons/comments.png";
import bookmarkIcon from "../assets/icons/bookmark.png";

const PostDetailModal = ({ post, onClose }) => {
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
          <span className="post-modal-stat">
            <img src={heartIcon} alt="Like" />
            {post.likeCount || 0}
          </span>
          <span className="post-modal-stat">
            <span className="reblog-stat-icon">↻</span>
            {post.reblogCount || 0}
          </span>
          <span className="post-modal-stat">
            <img src={commentIcon} alt="Comment" />
            0
          </span>
          <span className="post-modal-stat">
            <img src={bookmarkIcon} alt="Bookmark" />0
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
