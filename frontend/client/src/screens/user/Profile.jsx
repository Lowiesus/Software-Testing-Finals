import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { postAPI, authAPI, reblogAPI } from "../../utils/api";
import { getAssetUrl } from "../../utils/constants.js";
import { getErrorMessage } from "../../utils/helpers.js";
import Toast from "../../components/Toast.jsx";
import ProfilePostCard from "../../components/ProfilePostCard.jsx";
import "../../components/ProfilePostCard.css";
import "./Home.css";
import editProfileIcon from "../../assets/icons/edit-profile.png";

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reblogs, setReblogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });

  const isOwnProfile =
    !profileUserId ||
    (currentUserId && String(profileUserId) === String(currentUserId));

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "reblogs", label: "Reblogs" },
  ];

  useEffect(() => {
    fetchUserProfile();
  }, [profileUserId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const currentUserResponse = await authAPI.getProfile();
      const loggedInUser = currentUserResponse.data.user;
      setCurrentUserId(loggedInUser._id);

      const viewingOwnProfile =
        !profileUserId ||
        String(profileUserId) === String(loggedInUser._id);

      const profileUser = viewingOwnProfile
        ? loggedInUser
        : (await authAPI.getUserById(profileUserId)).data.user;

      setUser(profileUser);
      setBioDraft(profileUser.bio || "");

      const targetUserId = profileUser._id;
      const postsResponse = await postAPI.getUserPosts(targetUserId, 20, 0);
      setPosts(postsResponse.data.data || []);

      const reblogsResponse = viewingOwnProfile
        ? await reblogAPI.getRebloggedPosts(20, 0)
        : await reblogAPI.getUserRebloggedPosts(targetUserId, 20, 0);
      setReblogs(reblogsResponse.data.data || []);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(getErrorMessage(err, "Failed to load profile"));
      setUser(null);
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
            {isOwnProfile && (
              <img
                src={editProfileIcon}
                alt="Edit Profile"
                className="profile-edit-icon"
                onClick={() => navigate("/user/edit-profile")}
              />
            )}
          </div>

          <div className="profile-info">
            <h1>@{user.username}</h1>

            {isOwnProfile && editingBio ? (
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
              <div
                className={`profile-bio-display ${isOwnProfile ? "profile-bio-display--editable" : ""}`}
                onClick={isOwnProfile ? () => setEditingBio(true) : undefined}
              >
                {user.bio || (isOwnProfile ? "Click to add a bio..." : "No bio yet.")}
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
                  isOwner={isOwnProfile}
                  onUpdated={isOwnProfile ? fetchUserProfile : undefined}
                  onDeleted={isOwnProfile ? fetchUserProfile : undefined}
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
