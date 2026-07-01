import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Explore.css";
import preferencesIcon from "../../assets/icons/preferences.png";
import heartIcon from "../../assets/icons/heart-unfilled.png";
import commentIcon from "../../assets/icons/comments.png";
import bookmarkIcon from "../../assets/icons/bookmark.png";
import threeDotsIcon from "../../assets/icons/three-dots.png";

// Placeholder data
const placeholderPosts = [
  {
    id: 1,
    image: "https://picsum.photos/400/600",
    author: "user1",
    caption: "Beautiful landscape",
    tags: ["nature", "travel"],
    likes: 124,
    comments: 23,
  },
  {
    id: 2,
    image: "https://picsum.photos/400/300",
    author: "user2",
    caption: "City vibes",
    tags: ["urban", "photography"],
    likes: 89,
    comments: 12,
  },
  {
    id: 3,
    image: "https://picsum.photos/400/500",
    author: "user3",
    caption: "Adventure awaits",
    tags: ["adventure", "hiking"],
    likes: 156,
    comments: 34,
  },
  {
    id: 4,
    image: "https://picsum.photos/400/400",
    author: "user4",
    caption: "Sunset magic",
    tags: ["sunset", "sky"],
    likes: 203,
    comments: 45,
  },
  {
    id: 5,
    image: "https://picsum.photos/400/700",
    author: "user5",
    caption: "Mountain views",
    tags: ["mountains", "nature"],
    likes: 178,
    comments: 28,
  },
  {
    id: 6,
    image: "https://picsum.photos/400/350",
    author: "user6",
    caption: "Cozy moments",
    tags: ["lifestyle", "home"],
    likes: 92,
    comments: 15,
  },
  {
    id: 7,
    image: "https://picsum.photos/400/550",
    author: "user7",
    caption: "Ocean breeze",
    tags: ["ocean", "beach"],
    likes: 134,
    comments: 19,
  },
  {
    id: 8,
    image: "https://picsum.photos/400/450",
    author: "user8",
    caption: "Urban exploration",
    tags: ["city", "architecture"],
    likes: 167,
    comments: 31,
  },
  {
    id: 9,
    image: "https://picsum.photos/400/600",
    author: "user9",
    caption: "Forest path",
    tags: ["forest", "hiking"],
    likes: 145,
    comments: 22,
  },
  {
    id: 10,
    image: "https://picsum.photos/400/400",
    author: "user10",
    caption: "Minimalist art",
    tags: ["art", "design"],
    likes: 198,
    comments: 37,
  },
];

const UserExplore = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore");
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPosts(placeholderPosts);
      setLoading(false);
    }, 500);
  }, []);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="explore-container">
      {/* Header with tabs */}
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
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="masonry-grid">
        {loading ? (
          <div className="loading-message">Loading posts...</div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="masonry-item"
              onClick={() => handlePostClick(post)}
            >
              <img src={post.image} alt={post.caption} />
              <div className="masonry-overlay">
                <span className="masonry-author">@{post.author}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Modal */}
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
              <div className="post-modal-avatar"></div>
              <div>
                <div className="post-modal-username">
                  @{selectedPost.author}
                </div>
                <div className="post-modal-time">2 hours ago</div>
              </div>
            </div>

            <div className="post-modal-image">
              <img src={selectedPost.image} alt={selectedPost.caption} />
            </div>

            <p className="post-modal-caption">{selectedPost.caption}</p>

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
                {selectedPost.likes}
              </span>
              <span className="post-modal-stat">
                <img src={commentIcon} alt="Comment" />
                {selectedPost.comments}
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
