import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Sidebar.css";
import vivideLogo from "../../assets/icons/vivide logo white.png";
import homeIcon from "../../assets/icons/home.png";
import libraryIcon from "../../assets/icons/library.png";
import settingsIcon from "../../assets/icons/settings.png";
import logoutIcon from "../../assets/icons/logout.png";
import videoIcon from "../../assets/icons/video.png";
import articleIcon from "../../assets/icons/article.png";
import { getAssetUrl } from '../../utils/constants.js';
import { authAPI } from '../../utils/api.js';

const Sidebar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("user");
  const [profilePicture, setProfilePicture] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
            Search
          </button>
        </form>

        <div className="right-sidebar-title">Trending Today</div>
        <div className="right-sidebar-item">
          <div className="right-sidebar-icon-wrapper purple">
            <img src={videoIcon} alt="Video" className="right-sidebar-icon" />
          </div>
          <div className="right-sidebar-meta">
            <span className="right-sidebar-item-title">Title Here</span>
            <span className="right-sidebar-handle">@famous_person</span>
          </div>
        </div>
        <div className="right-sidebar-item">
          <div className="right-sidebar-icon-wrapper green">
            <img
              src={articleIcon}
              alt="Article"
              className="right-sidebar-icon"
            />
          </div>
          <div className="right-sidebar-meta">
            <span className="right-sidebar-item-title">Title Here</span>
            <span className="right-sidebar-handle">@famous_person2</span>
          </div>
        </div>

        <div className="right-sidebar-title">Recommended for you</div>
        <div className="right-sidebar-tags">
          <span className="right-sidebar-tag">Life</span>
          <span className="right-sidebar-tag">Science</span>
          <span className="right-sidebar-tag">Technology</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
