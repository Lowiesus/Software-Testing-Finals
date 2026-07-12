import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Explore.css";
import { postAPI } from "../../utils/api";
import { getAssetUrl } from "../../utils/constants.js";
import { getErrorMessage } from "../../utils/helpers.js";
import heartIcon from "../../assets/icons/heart-unfilled.png";
import commentIcon from "../../assets/icons/comments.png";
import bookmarkIcon from "../../assets/icons/bookmark.png";

const UserExplore = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore");
  const [exploreTab, setExploreTab] = useState("most-liked");
  const [mostLikedPosts, setMostLikedPosts] = useState([]);
  const [mostRepostedPosts, setMostRepostedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await postAPI.getExploreTrending(12);
      setMostLikedPosts(response.data.data?.mostLiked || []);
      setMostRepostedPosts(response.data.data?.mostReposted || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load explore posts"));
      setMostLikedPosts([]);
      setMostRepostedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const visiblePosts =
    exploreTab === "most-liked" ? mostLikedPosts : mostRepostedPosts;

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="explore-container">
      <div className="explore-header">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "for-you" ? "active" : ""}`}
            onClick={() => navigate("/user/home")}
          >
            For You
          </button>

          <button
            className={`tab ${activeTab === "explore" ? "active" : ""}`}
            onClick={() => setActiveTab("explore")}
          >
            Explore
          </button>

          <button className="tab" onClick={() => navigate("/user/search")}>
            Search
          </button>
        </div>
      </div>

      <div className="explore-subtabs">
        <button
          className={`explore-subtab ${exploreTab === "most-liked" ? "active" : ""}`}
          onClick={() => setExploreTab("most-liked")}
        >
          Most Liked
        </button>
        <button
          className={`explore-subtab ${exploreTab === "most-reposted" ? "active" : ""}`}
          onClick={() => setExploreTab("most-reposted")}
        >
          Most Reposted
        </button>
      </div>

      <div className="masonry-grid">
        {loading ? (
          <div className="loading-message">Loading posts...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : visiblePosts.length === 0 ? (
          <div className="empty-message">
            No {exploreTab === "most-liked" ? "liked" : "reposted"} posts yet.
          </div>
        ) : (
          visiblePosts.map((post) => (
            <div
              key={post._id}
              className="masonry-item"
              onClick={() => handlePostClick(post)}
            >
              <img
                src={getAssetUrl(post.image)}
                alt={post.caption || "Post"}
              />
              <div className="masonry-overlay">
                <span className="masonry-author">@{post.author_username}</span>
                <span className="masonry-stat">
                  {exploreTab === "most-liked"
                    ? `${post.likeCount || 0} likes`
                    : `${post.reblogCount || 0} reposts`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPost && (
        <div className="post-modal-overlay" onClick={closeModal}>
          <div
            className="post-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="post-modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="post-modal-header">
              <div className="post-modal-avatar">
                {selectedPost.author_profilePicture && (
                  <img
                    src={getAssetUrl(selectedPost.author_profilePicture)}
                    alt={selectedPost.author_username}
                  />
                )}
              </div>
              <div>
                <div className="post-modal-username">
                  @{selectedPost.author_username}
                </div>
                <div className="post-modal-time">
                  {selectedPost.category || "Post"}
                </div>
              </div>
            </div>

            <div className="post-modal-image">
              <img
                src={getAssetUrl(selectedPost.image)}
                alt={selectedPost.caption || "Post"}
              />
            </div>

            <p className="post-modal-caption">
              {truncateText(selectedPost.caption, 200)}
            </p>

            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="post-modal-tags">
                {selectedPost.tags.map((tag) => (
                  <span key={tag} className="post-modal-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="post-modal-stats">
              <span className="post-modal-stat">
                <img src={heartIcon} alt="Like" />
                {selectedPost.likeCount || 0}
              </span>
              <span className="post-modal-stat">
                <span className="reblog-stat-icon">↻</span>
                {selectedPost.reblogCount || 0}
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
      )}
    </div>
  );
};

export default UserExplore;
