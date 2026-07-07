import { useState } from "react";
import { postAPI } from "../utils/api.js";
import { getAssetUrl } from "../utils/constants.js";
import { getErrorMessage } from "../utils/helpers.js";
import threeDotsIcon from "../assets/icons/three-dots.png";
import "./ProfilePostCard.css";

const categories = ["Clothing", "Cosmetics", "Accessories"];

export default function ProfilePostCard({ post, isOwner, onUpdated, onDeleted }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [editCategory, setEditCategory] = useState(post.category);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditPost = async () => {
    if (!editCaption.trim()) return;

    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append("caption", editCaption);
      formData.append("category", editCategory);
      await postAPI.updatePost(post._id, formData);
      setShowEditModal(false);
      onUpdated?.();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to update post"));
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await postAPI.deletePost(post._id);
      onDeleted?.();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete post"));
    }
  };

  return (
    <div className={`profile-post-card${showMenu ? " menu-open" : ""}`}>
      <div className="profile-post-header">
        <div className="profile-post-author">
          <div className="profile-post-avatar">
            {post.author_profilePicture ? (
              <img src={getAssetUrl(post.author_profilePicture)} alt={post.author_username} />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <p className="profile-post-username">@{post.author_username}</p>
            <span className="profile-post-date">
              {new Date(post.created_at).toLocaleDateString()}
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
      </div>

      <p className="profile-post-caption">{post.caption}</p>

      {post.image && (
        <img src={getAssetUrl(post.image)} alt="Post" className="profile-post-image" />
      )}

      {post.tags?.length > 0 && (
        <div className="profile-post-tags">
          {post.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}

      {showEditModal && (
        <div className="profile-edit-modal-overlay">
          <div className="profile-edit-modal">
            <h2>Edit Post</h2>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              rows={4}
            />
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="profile-edit-modal-actions">
              <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button type="button" onClick={handleEditPost} disabled={isEditing}>
                {isEditing ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
