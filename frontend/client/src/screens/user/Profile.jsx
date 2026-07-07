import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI, authAPI, reblogAPI } from "../../utils/api";
import { getAssetUrl } from "../../utils/constants.js";
import { getErrorMessage } from "../../utils/helpers.js";
import Toast from "../../components/Toast.jsx";
import ProfilePostCard from "../../components/ProfilePostCard.jsx";
import "./Home.css";
import "../components/ProfilePostCard.css";
import editProfileIcon from "../../assets/icons/edit-profile.png";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reblogs, setReblogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "reblogs", label: "Reblogs" },
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userResponse = await authAPI.getProfile();
      const currentUser = userResponse.data.user;
      setUser(currentUser);
      setBioDraft(currentUser.bio || "");

      const postsResponse = await postAPI.getUserPosts(currentUser._id, 20, 0);
      setPosts(postsResponse.data.data || []);

      const reblogsResponse = await reblogAPI.getRebloggedPosts(20, 0);
      setReblogs(reblogsResponse.data.data || []);

      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      await authAPI.updateProfile({ bio: bioDraft });
      setUser((prev) => ({ ...prev, bio: bioDraft }));
      setEditingBio(false);
      setToast({ message: "Bio updated successfully!", type: "success" });
    } catch (err) {
      setToast({ message: getErrorMessage(err, "Failed to update bio"), type: "error" });
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!user) {
    return <div className="profile-loading">{error || "Failed to load profile"}</div>;
  }

  return (
    <div className="home-container">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />

      <div className="profile-page">
        <div className="profile-header-card">
          <div className="profile-picture-wrap">
            <div className="profile-picture">
              {user.profilePicture ? (
                <img src={getAssetUrl(user.profilePicture)} alt={user.username} />
              ) : (
                <span>👤</span>
              )}
            </div>
            <img
              src={editProfileIcon}
              alt="Edit Profile"
              className="profile-edit-icon"
              onClick={() => navigate("/user/edit-profile")}
            />
          </div>

          <div className="profile-info">
            <h1>@{user.username}</h1>

            {editingBio ? (
              <>
                <textarea
                  className="profile-bio-input"
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="Write your bio..."
                  maxLength={160}
                />
                <div className="profile-bio-actions">
                  <button type="button" className="profile-bio-save" onClick={handleSaveBio}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="profile-bio-cancel"
                    onClick={() => {
                      setBioDraft(user.bio || "");
                      setEditingBio(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="profile-bio-display" onClick={() => setEditingBio(true)}>
                {user.bio || "Click to add a bio..."}
              </div>
            )}

            <div className="profile-post-count">
              {posts.length} posts · {reblogs.length} reblogs
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="profile-tab-content">
          {activeTab === "posts" && (
            posts.length === 0 ? (
              <p>No posts yet.</p>
            ) : (
              posts.map((post) => (
                <ProfilePostCard
                  key={post._id}
                  post={post}
                  isOwner
                  onUpdated={fetchUserProfile}
                  onDeleted={fetchUserProfile}
                />
              ))
            )
          )}

          {activeTab === "reblogs" && (
            reblogs.length === 0 ? (
              <p>No reblogs yet.</p>
            ) : (
              reblogs.map((post) => (
                <ProfilePostCard key={post._id} post={post} isOwner={false} />
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
