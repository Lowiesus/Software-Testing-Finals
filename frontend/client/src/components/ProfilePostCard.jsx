import { useState, useEffect } from "react";
import { postAPI, reblogAPI } from "../utils/api.js";
import { getAssetUrl } from "../utils/constants.js";
import { getErrorMessage } from "../utils/helpers.js";
import EditPostModal from "./EditPostModal.jsx";
import threeDotsIcon from "../assets/icons/three-dots.png";
import "./ProfilePostCard.css";

export default function ProfilePostCard({ post, isOwner, onUpdated, onDeleted, onRemoveReblog }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayPost, setDisplayPost] = useState(post);
  const [removingReblog, setRemovingReblog] = useState(false);

  useEffect(() => {
    setDisplayPost(post);
  }, [post]);

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await postAPI.deletePost(displayPost._id);
      onDeleted?.();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete post"));
    }
  };

  const handleRemoveReblog = async () => {
    if (!onRemoveReblog || removingReblog) return;

    setRemovingReblog(true);
    try {
      await reblogAPI.removeReblog(displayPost._id);
      onRemoveReblog(displayPost._id);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to remove reblog"));
    } finally {
      setRemovingReblog(false);
    }
  };

  return (
    <div className={`profile-post-card${showMenu ? " menu-open" : ""}`}>
      <div className="profile-post-header">
        <div className="profile-post-author">
          <div className="profile-post-avatar">
            {displayPost.author_profilePicture ? (
              <img src={getAssetUrl(displayPost.author_profilePicture)} alt={displayPost.author_username} />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <p className="profile-post-username">@{displayPost.author_username}</p>
            <span className="profile-post-date">
              {new Date(displayPost.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className={`profile-post-menu-wrap${showMenu ? " is-open" : ""}`}>
            <img
              src={threeDotsIcon}
              alt="More"
              className="profile-post-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className="profile-post-menu">
                <button
                  type="button"
                  className="profile-post-menu-edit"
                  onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="profile-post-menu-delete"
                  onClick={() => { handleDeletePost(); setShowMenu(false); }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {onRemoveReblog && (
          <button
            type="button"
            className="profile-post-remove-reblog"
            onClick={handleRemoveReblog}
            disabled={removingReblog}
            title="Remove reblog"
          >
            {removingReblog ? "..." : "Remove reblog"}
          </button>
        )}
      </div>

      <p className="profile-post-caption">{displayPost.caption}</p>

      {displayPost.image && (
        <img src={getAssetUrl(displayPost.image)} alt="Post" className="profile-post-image" />
      )}

      {displayPost.tags?.length > 0 && (
        <div className="profile-post-tags">
          {displayPost.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}

      <EditPostModal
        post={displayPost}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={(updated) => {
          setDisplayPost((prev) => ({ ...prev, ...updated }));
          onUpdated?.();
        }}
      />
    </div>
  );
}
