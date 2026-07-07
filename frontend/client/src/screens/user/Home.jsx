import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { postAPI, commentAPI, bookmarkAPI, likeAPI } from "../../utils/api";
import { getAssetUrl } from "../../utils/constants.js";
import { clampCount } from "../../utils/helpers.js";
import AnimatedContent from "../../component/AnimatedContent";
import galleryIcon from "../../assets/icons/gallery.png";
import gifIcon from "../../assets/icons/gif.png";
import tagsIcon from "../../assets/icons/tags.png";
import emojiIcon from "../../assets/icons/emoji.png";
import scheduleIcon from "../../assets/icons/schedule.png";
import preferencesIcon from "../../assets/icons/preferences.png";
import heartIcon from "../../assets/icons/heart-unfilled.png";
import commentIcon from "../../assets/icons/comments.png";
import bookmarkIcon from "../../assets/icons/bookmark.png";
import threeDotsIcon from "../../assets/icons/three-dots.png";
import postTypeIcon from "../../assets/icons/chevron-down.svg";
import categoryIcon from "../../assets/icons/category.svg";

const availableTags = [
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

const UserHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("for-you");
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showPostTypeSelector, setShowPostTypeSelector] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState("Standard Post");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPostType, setFilterPostType] = useState("");

  const availableCategories = ["Clothing", "Cosmetics", "Accessories"];
  const availablePostTypes = ["Standard Post", "Tutorial"];

  // Fetch posts on component mount and when tab changes
  useEffect(() => {
    fetchPosts();
  }, [activeTab, filterCategory, filterPostType]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await postAPI.getAllPosts(20, 0);
      let filteredPosts = response.data.data || [];

      // Filter by category if selected
      if (filterCategory) {
        filteredPosts = filteredPosts.filter(
          (post) => post.category === filterCategory,
        );
      }

      // Filter by post type if selected
      if (filterPostType) {
        filteredPosts = filteredPosts.filter(
          (post) => post.post_type === filterPostType,
        );
      }

      setPosts(filteredPosts);
      setError("");
    } catch (err) {
      setError("Failed to load posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    if (filterCategory === category) {
      setFilterCategory("");
    } else {
      setFilterCategory(category);
    }
  };

  const handlePostTypeFilter = (postType) => {
    if (filterPostType === postType) {
      setFilterPostType("");
    } else {
      setFilterPostType(postType);
    }
  };

  const togglePostModal = () => {
    setShowPostModal(!showPostModal);
    if (!showPostModal) {
      setPostContent("");
      setPostImage(null);
      setImagePreview(null);
      setSelectedTags([]);
      setShowTagSelector(false);
      setSelectedCategory("");
      setShowCategorySelector(false);
      setSelectedPostType("Standard Post");
      setShowPostTypeSelector(false);
      setError("");
    }
  };

  const toggleTagSelector = () => {
    setShowTagSelector(!showTagSelector);
  };

  const toggleCategorySelector = () => {
    setShowCategorySelector(!showCategorySelector);
  };

  const togglePostTypeSelector = () => {
    setShowPostTypeSelector(!showPostTypeSelector);
  };

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!postContent.trim()) {
        setError("Please write something in your post");
        setSubmitting(false);
        return;
      }

      if (!selectedCategory) {
        setError("Please select a category");
        setSubmitting(false);
        return;
      }

      if (!postImage) {
        setError("Please select an image");
        setSubmitting(false);
        return;
      }

      // Create FormData for multipart upload
      const uploadFormData = new FormData();
      uploadFormData.append("caption", postContent);
      uploadFormData.append("category", selectedCategory);
      uploadFormData.append("post_type", selectedPostType);
      uploadFormData.append("image", postImage);

      // Add tags if provided
      if (selectedTags.length > 0) {
        uploadFormData.append("tags", selectedTags.join(","));
      }

      // Create post
      const response = await postAPI.createPost(uploadFormData);

      if (response.data?.data) {
        // Add new post to the beginning of the feed
        setPosts([response.data.data, ...posts]);
        togglePostModal();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create post";
      setError(errorMsg);
      console.error("Error submitting post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      {/* Header with tabs */}
      <div className="home-header">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "for-you" ? "active" : ""}`}
            onClick={() => setActiveTab("for-you")}
          >
            For You
          </button>

          <button
            className={`tab ${activeTab === "explore" ? "active" : ""}`}
            onClick={() => navigate("/user/explore")}
          >
            Explore
          </button>
        </div>
        <div className="preferences-wrapper">
          <img
            src={preferencesIcon}
            alt="Preferences"
            className="preferences-icon"
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          />
          {showCategoryFilter && (
            <AnimatedContent>
              <div className="category-filter-dropdown">
                <div className="category-filter-title">Filter by Category</div>
                <div
                  onClick={() => handleCategoryFilter("")}
                  className={`category-filter-option all-option ${
                    filterCategory === "" ? "active" : ""
                  }`}
                >
                  All Categories
                </div>
                {availableCategories.map((category) => (
                  <div
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`category-filter-option category-option ${
                      filterCategory === category ? "active" : ""
                    }`}
                  >
                    {category}
                  </div>
                ))}

                <div className="category-filter-divider"></div>

                <div className="category-filter-title">Filter by Post Type</div>
                <div
                  onClick={() => handlePostTypeFilter("")}
                  className={`category-filter-option all-option ${
                    filterPostType === "" ? "active" : ""
                  }`}
                >
                  All Types
                </div>
                {availablePostTypes.map((type) => (
                  <div
                    key={type}
                    onClick={() => handlePostTypeFilter(type)}
                    className={`category-filter-option post-type-filter-option ${
                      filterPostType === type ? "active" : ""
                    }`}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </AnimatedContent>
          )}
        </div>
      </div>

      {/* Post Creation Button */}
      <div className="post-creation">
        <div className="post-avatar"></div>
        <button onClick={togglePostModal} className="post-trigger">
          What's happening?
        </button>
      </div>

      {/* Post Submission Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={togglePostModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={togglePostModal} className="modal-close"></button>

            <h2 className="modal-title">Create a New Post</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmitPost} className="post-form">
              <div className="form-group">
                <label htmlFor="postContent" className="form-label">
                  What's on your mind?
                </label>
                <textarea
                  name="postContent"
                  id="postContent"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  required
                  rows="6"
                  placeholder="Share your thoughts..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="postImage" className="form-label">
                  Upload Image (optional)
                </label>
                <input
                  type="file"
                  name="postImage"
                  accept="image/*"
                  id="postImage"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setPostImage(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="form-input-file"
                />
                {imagePreview && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                  </div>
                )}
              </div>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="selected-tags-container">
                  <label className="form-label">Selected Tags:</label>
                  <div className="selected-tags">
                    {selectedTags.map((tag) => (
                      <span key={tag} className="selected-tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          className="remove-tag"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Category Display */}
              {selectedCategory && (
                <div className="selected-tags-container">
                  <label className="form-label">Category:</label>
                  <div className="selected-tags">
                    <span className="selected-tag category-tag">
                      {selectedCategory}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("")}
                        className="remove-tag"
                      >
                        &times;
                      </button>
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Post Type Display */}
              {selectedPostType && (
                <div className="selected-tags-container">
                  <label className="form-label">Post Type:</label>
                  <div className="selected-tags">
                    <span className="selected-tag post-type-tag">
                      {selectedPostType}
                      <button
                        type="button"
                        onClick={() => setSelectedPostType("")}
                        className="remove-tag"
                      >
                        &times;
                      </button>
                    </span>
                  </div>
                </div>
              )}

              <div className="modal-toolbar">
                <div className="toolbar-icons">
                  <img
                    src={tagsIcon}
                    alt="Tags"
                    className="toolbar-icon"
                    onClick={toggleTagSelector}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src={categoryIcon}
                    alt="Category"
                    className="toolbar-icon"
                    onClick={toggleCategorySelector}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src={postTypeIcon}
                    alt="Post Type"
                    className="toolbar-icon"
                    onClick={togglePostTypeSelector}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>

              {/* Tag Selector */}
              {showTagSelector && (
                <div className="tag-selector">
                  <div className="tag-selector-header">
                    <span className="tag-selector-title">Select Tags</span>
                    <button
                      type="button"
                      onClick={toggleTagSelector}
                      className="tag-selector-close"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="tag-selector-tags">
                    {availableTags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => handleTagSelect(tag)}
                        className={`tag-selector-tag ${
                          selectedTags.includes(tag) ? "selected" : ""
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Selector */}
              {showCategorySelector && (
                <div className="tag-selector">
                  <div className="tag-selector-header">
                    <span className="tag-selector-title">Select Category</span>
                    <button
                      type="button"
                      onClick={toggleCategorySelector}
                      className="tag-selector-close"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="tag-selector-tags">
                    {availableCategories.map((category) => (
                      <span
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategorySelector(false);
                        }}
                        className={`tag-selector-tag category-option ${
                          selectedCategory === category ? "selected" : ""
                        }`}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Type Selector */}
              {showPostTypeSelector && (
                <div className="tag-selector">
                  <div className="tag-selector-header">
                    <span className="tag-selector-title">Select Post Type</span>
                    <button
                      type="button"
                      onClick={togglePostTypeSelector}
                      className="tag-selector-close"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="tag-selector-tags">
                    {availablePostTypes.map((type) => (
                      <span
                        key={type}
                        onClick={() => {
                          setSelectedPostType(type);
                          setShowPostTypeSelector(false);
                        }}
                        className={`tag-selector-tag post-type-option ${
                          selectedPostType === type ? "selected" : ""
                        }`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="feed">
        {loading ? (
          <div className="loading-message">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="empty-message">
            No posts yet. Be the first to create one!
          </div>
        ) : (
          posts.map((post) => <PostItem key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

// PostItem Component - handles individual post display and interactions
const PostItem = ({ post }) => {
  const [stats, setStats] = useState({
    likeCount: 0,
    commentCount: 0,
    bookmarkCount: 0,
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [editCategory, setEditCategory] = useState(post.category);
  const [editTags, setEditTags] = useState(post.tags || []);
  const [isEditing, setIsEditing] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [post._id]);

  const normalizeStats = (data = {}) => ({
    likeCount: clampCount(data.likeCount),
    commentCount: clampCount(data.commentCount),
    bookmarkCount: clampCount(data.bookmarkCount),
  });

  const fetchStats = async () => {
    try {
      const response = await postAPI.getPostStats(post._id);
      setStats(normalizeStats(response.data.data));

      // Check if user has liked this post
      try {
        const likeCheckResponse = await likeAPI.isPostLikedByUser(post._id);
        setIsLiked(likeCheckResponse.data.data || false);
      } catch (err) {
        console.error("Error checking like status:", err);
        setIsLiked(false);
      }

      // Check if user has bookmarked this post
      try {
        const bookmarkCheckResponse = await bookmarkAPI.isPostBookmarkedByUser(
          post._id,
        );
        setIsBookmarked(bookmarkCheckResponse.data.data || false);
      } catch (err) {
        console.error("Error checking bookmark status:", err);
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLike = async () => {
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
    if (bookmarkLoading) return;

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

  const loadComments = async () => {
    try {
      console.log("Loading comments for post:", post._id);
      const response = await commentAPI.getComments(post._id);
      console.log("Comments loaded:", response.data.data);
      setComments(response.data.data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      alert("Failed to load comments: " + error.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    console.log("handleAddComment called, comment text:", newComment);
    if (!newComment.trim()) {
      console.log("Comment is empty");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting comment to post:", post._id);
      await commentAPI.addComment(post._id, newComment);
      console.log("Comment submitted successfully");
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
      await commentAPI.deleteComment(post._id, commentId);
      setStats((prev) => ({ ...prev, commentCount: prev.commentCount - 1 }));
      loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

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
      setShowEditModal(false);
      // Update local post data
      post.caption = editCaption;
      post.category = editCategory;
      post.tags = editTags;
      alert("Post updated successfully");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post: " + error.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await postAPI.deletePost(post._id);
      alert("Post deleted successfully");
      window.location.reload(); // Reload to refresh post list
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post: " + error.message);
    }
  };

  const toggleComments = () => {
    console.log("Toggle comments - current state:", showComments);
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
    console.log("New state:", !showComments);
  };

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-avatar">
          {post.author_profilePicture && (
            <img
              src={`${getAssetUrl(post.author_profilePicture)}`}
              alt={post.author_username}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "inherit",
                transform: "scaleX(-1) scaleY(-1)",
              }}
            />
          )}
        </div>
        <div className="post-meta">
          <span className="username">@{post.author_username || "user"}</span>
          <span className="time">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <img
            src={threeDotsIcon}
            alt="More"
            className="more-menu"
            onClick={() => setShowMenu(!showMenu)}
            style={{ cursor: "pointer" }}
          />
          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "30px",
                backgroundColor: "#fff",
                border: "1px solid #e1e8ed",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 100,
                minWidth: "120px",
              }}
            >
              <button
                onClick={() => {
                  setShowEditModal(true);
                  setShowMenu(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 16px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#000",
                  borderBottom: "1px solid #e1e8ed",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  handleDeletePost();
                  setShowMenu(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 16px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#e74c3c",
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {post.image && (
        <div className="post-image-wrapper">
          <img
            src={`${getAssetUrl(post.image)}`}
            alt="Post"
            className="post-image"
          />
        </div>
      )}

      <p className="post-text">{post.caption}</p>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="post-stats">
        <span
          className={`stat-item ${isLiked ? "active" : ""}`}
          onClick={handleLike}
          title="Like"
        >
          <img src={heartIcon} alt="Like" className="stat-icon" />
          {stats.likeCount}
        </span>
        <span
          className={`stat-item ${showComments ? "active" : ""}`}
          onClick={toggleComments}
          title="Comment"
        >
          <img src={commentIcon} alt="Comment" className="stat-icon" />
          {stats.commentCount}
        </span>
        <span
          className={`stat-item ${isBookmarked ? "active" : ""}`}
          onClick={handleBookmark}
          title="Bookmark"
        >
          <img src={bookmarkIcon} alt="Bookmark" className="stat-icon" />
          {clampCount(stats.bookmarkCount)}
        </span>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleAddComment} className="comment-form">
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

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <strong className="comment-author">
                      @{comment.author_username}
                    </strong>
                    <small className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
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
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setEditTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag],
                      );
                    }}
                    style={{
                      border: editTags.includes(tag)
                        ? "none"
                        : "2px solid #ff7a4f",
                      backgroundColor: editTags.includes(tag)
                        ? "#ff7a4f"
                        : "transparent",
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
                onClick={() => setShowEditModal(false)}
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
      )}
    </div>
  );
};

export default UserHome;
