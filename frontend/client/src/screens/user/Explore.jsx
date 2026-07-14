import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Explore.css";
import { postAPI } from "../../utils/api";
import { getAssetUrl } from "../../utils/constants.js";
import { getErrorMessage } from "../../utils/helpers.js";
import PostDetailModal from "../../components/PostDetailModal.jsx";

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

      <PostDetailModal post={selectedPost} onClose={closeModal} />
    </div>
  );
};

export default UserExplore;
