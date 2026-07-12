import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Sidebar.css";
import vivideLogo from "../../assets/icons/vivide logo white.png";
import homeIcon from "../../assets/icons/home.png";
import libraryIcon from "../../assets/icons/library.png";
import settingsIcon from "../../assets/icons/settings.png";
import logoutIcon from "../../assets/icons/logout.png";
import videoIcon from "../../assets/icons/video.png";
import { getAssetUrl, RECOMMENDED_TAGS } from '../../utils/constants.js';
import { authAPI, postAPI } from '../../utils/api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isExplorePage = location.pathname === "/user/explore";
  const [username, setUsername] = useState("user");
  const [profilePicture, setProfilePicture] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mostLikedPosts, setMostLikedPosts] = useState([]);
  const [mostRepostedPosts, setMostRepostedPosts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchUserProfile();

    const handleUsernameUpdate = (e) => {
      if (e.detail) {
        setUsername(e.detail);
      }
    };

    window.addEventListener("usernameUpdated", handleUsernameUpdate);
    return () => window.removeEventListener("usernameUpdated", handleUsernameUpdate);
  }, []);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const response = await authAPI.getProfile();
        if (response.data.user.profilePicture) {
          setProfilePicture(
            getAssetUrl(response.data.user.profilePicture)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      navigate("/user/search");
      return;
    }

    navigate(`/user/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const fetchTrendingPosts = async () => {
    setTrendingLoading(true);
    setTrendingError("");

    try {
      const response = await postAPI.getExploreTrending(5);
      setMostLikedPosts(response.data.data?.mostLiked || []);
      setMostRepostedPosts(response.data.data?.mostReposted || []);
    } catch (error) {
      setTrendingError(getErrorMessage(error, "Failed to load trending posts"));
      setMostLikedPosts([]);
      setMostRepostedPosts([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  const truncateText = (text, maxLength = 42) => {
    if (!text) return "Untitled post";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const handleTagClick = (tag) => {
    navigate(`/user/search?tag=${encodeURIComponent(tag)}`);
  };

  const renderTrendingPost = (post, statLabel, wrapperClass, onClickPath = "/user/explore") => (
    <button
      key={post._id}
      type="button"
      className="right-sidebar-item right-sidebar-item--clickable"
      onClick={() => navigate(onClickPath)}
    >
      <div className={`right-sidebar-icon-wrapper ${wrapperClass}`}>
        {post.image ? (
          <img
            src={getAssetUrl(post.image)}
            alt={post.caption || "Post"}
            className="right-sidebar-post-thumb"
          />
        ) : (
          <img src={videoIcon} alt="Post" className="right-sidebar-icon" />
        )}
      </div>
      <div className="right-sidebar-meta">
        <span className="right-sidebar-item-title">
          {truncateText(post.caption)}
        </span>
        <span className="right-sidebar-handle">
          @{post.author_username} · {statLabel}
        </span>
      </div>
    </button>
  );

  return (
    <>
      <div className="sidebar">
        <img src={vivideLogo} alt="Vivide" className="logo" />

        <nav>
          <NavLink
            to="/user/home"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <img src={homeIcon} alt="Home" className="nav-icon" />
            Home
          </NavLink>

          <NavLink
            to="/user/library"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <img src={libraryIcon} alt="Library" className="nav-icon" />
            Library
          </NavLink>

          <NavLink
            to="/user/settings"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <img src={settingsIcon} alt="Settings" className="nav-icon" />
            Settings
          </NavLink>

          <button onClick={handleLogout} className="nav-link logout-btn">
            <img src={logoutIcon} alt="Log Out" className="nav-icon" />
            Log Out
          </button>
        </nav>

        <div className="user-profile">
          <div className="user-avatar">
            {profilePicture && (
              <img
                src={profilePicture}
                alt={username}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "inherit",
                }}
              />
            )}
          </div>
          <div className="user-info">
            <div className="user-username">@{username}</div>
            <NavLink to="/user/profile" className="view-profile">
              View profile
            </NavLink>
          </div>
        </div>
      </div>

      <aside className="right-sidebar">
        <form className="right-sidebar-search-form" onSubmit={handleSearch}>
          <input
            className="right-sidebar-search"
            placeholder="Search Here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="right-sidebar-search-btn"
            aria-label="Search"
          >
            <svg
              className="right-sidebar-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M20 20L16.5 16.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>

        {isExplorePage ? (
          <div className="right-sidebar-trending">
            {trendingLoading && (
              <p className="right-sidebar-status">Loading trending posts...</p>
            )}

            {trendingError && (
              <p className="right-sidebar-status right-sidebar-status--error">
                {trendingError}
              </p>
            )}

            {!trendingLoading && !trendingError && (
              <>
                <div className="right-sidebar-title">Most Liked</div>
                {mostLikedPosts.length > 0 ? (
                  mostLikedPosts.map((post) =>
                    renderTrendingPost(
                      post,
                      `${post.likeCount || 0} likes`,
                      "purple",
                    ),
                  )
                ) : (
                  <p className="right-sidebar-empty">No liked posts yet.</p>
                )}

                <div className="right-sidebar-title">Most Reposted</div>
                {mostRepostedPosts.length > 0 ? (
                  mostRepostedPosts.map((post) =>
                    renderTrendingPost(
                      post,
                      `${post.reblogCount || 0} reposts`,
                      "green",
                    ),
                  )
                ) : (
                  <p className="right-sidebar-empty">No reposted posts yet.</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="right-sidebar-trending">
            {trendingLoading && (
              <p className="right-sidebar-status">Loading trending posts...</p>
            )}

            {trendingError && (
              <p className="right-sidebar-status right-sidebar-status--error">
                {trendingError}
              </p>
            )}

            {!trendingLoading && !trendingError && (
              <>
                <div className="right-sidebar-title">Trending Today</div>
                {mostLikedPosts.length > 0 ? (
                  mostLikedPosts.slice(0, 3).map((post) =>
                    renderTrendingPost(
                      post,
                      `${post.likeCount || 0} likes`,
                      "purple",
                      "/user/explore",
                    ),
                  )
                ) : (
                  <p className="right-sidebar-empty">No liked posts yet.</p>
                )}

                <div className="right-sidebar-title">Recommended for you</div>
                <div className="right-sidebar-tags">
                  {RECOMMENDED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="right-sidebar-tag"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
