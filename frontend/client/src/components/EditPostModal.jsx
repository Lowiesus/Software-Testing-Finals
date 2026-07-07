import { useEffect, useState } from "react";
import { postAPI } from "../utils/api.js";
import { getErrorMessage } from "../utils/helpers.js";

const AVAILABLE_TAGS = [
  "Life",
  "Science",
  "Technology",
  "Health",
  "Education",
  "Art",
  "Music",
  "Sports",
  "Travel",
  "Food",
  "Business",
  "Entertainment",
  "Fashion",
  "Gaming",
  "News",
];

export default function EditPostModal({ post, isOpen, onClose, onSuccess }) {
  const [editCaption, setEditCaption] = useState(post.caption);
  const [editCategory, setEditCategory] = useState(post.category);
  const [editTags, setEditTags] = useState(post.tags || []);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditCaption(post.caption);
      setEditCategory(post.category || "");
      setEditTags(post.tags || []);
    }
  }, [isOpen, post]);

  if (!isOpen) return null;

  const handleEditPost = async () => {
    if (!editCaption.trim()) {
      alert("Caption cannot be empty");
      return;
    }

    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append("caption", editCaption);
      formData.append("category", editCategory);
      if (editTags.length > 0) {
        formData.append("tags", editTags.join(","));
      }

      await postAPI.updatePost(post._id, formData);
      onSuccess?.({
        caption: editCaption,
        category: editCategory,
        tags: editTags,
      });
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      alert(getErrorMessage(error, "Failed to update post"));
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#000" }}>Edit Post</h2>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#000",
              fontWeight: "500",
            }}
          >
            Caption
          </label>
          <textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #e1e8ed",
              fontSize: "14px",
              fontFamily: "inherit",
              backgroundColor: "#f7f7f7",
              minHeight: "100px",
              boxSizing: "border-box",
              color: "#000",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#000",
              fontWeight: "500",
            }}
          >
            Category
          </label>
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #e1e8ed",
              fontSize: "14px",
              backgroundColor: "#f7f7f7",
              color: "#000",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select Category</option>
            <option value="Clothing">Clothing</option>
            <option value="Cosmetics">Cosmetics</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              color: "#000",
              fontWeight: "500",
            }}
          >
            Tags
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setEditTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag],
                  );
                }}
                style={{
                  border: editTags.includes(tag) ? "none" : "2px solid #ff7a4f",
                  backgroundColor: editTags.includes(tag) ? "#ff7a4f" : "transparent",
                  color: editTags.includes(tag) ? "#fff" : "#ff7a4f",
                  borderRadius: "20px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #e1e8ed",
              background: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              color: "#000",
              fontWeight: "500",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleEditPost}
            disabled={isEditing}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#1d9bf0",
              color: "#fff",
              cursor: isEditing ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: isEditing ? 0.6 : 1,
            }}
          >
            {isEditing ? "Updating..." : "Update Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
