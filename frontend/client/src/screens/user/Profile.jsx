import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI, authAPI } from "../../utils/api";
import axios from "axios";
import "./Home.css";
import editProfileIcon from "../../assets/icons/edit-profile.png";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "reblogs", label: "Reblogs" },
    { id: "tagged", label: "Tagged" },
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Fetch user data
      const userResponse = await authAPI.getProfile();
      console.log("Fetching posts for user:", userResponse.data.user._id);
      setUser(userResponse.data.user);

      // Fetch user's posts
      const postsResponse = await postAPI.getUserPosts(
        userResponse.data.user._id,
        20,
        0,
      );
      console.log("Posts response:", postsResponse.data);
      setPosts(postsResponse.data.data || []);

      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "60px 20px",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          padding: "60px 20px",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>{error || "Failed to load profile"}</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          {/* Profile Picture */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50% 50% 0% 50%",
                background: "#ccc",
                border: "3px solid #000",
                flexShrink: 0,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {user.profilePicture ? (
                <img
                  src={`http://localhost:3000${user.profilePicture}`}
                  alt={user.username}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span style={{ fontSize: "48px" }}>👤</span>
              )}
            </div>
            {/* Edit Icon */}
            <img
              src={editProfileIcon}
              alt="Edit Profile"
              onClick={() => navigate("/user/edit-profile")}
              style={{
                position: "absolute",
                bottom: "-5px",
                right: "-10px",
                width: "40px",
                height: "40px",
                cursor: "pointer",
              }}
            />
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#000",
                margin: "0 0 10px 0",
              }}
            >
              @{user.username}
            </h1>

            <input
              type="text"
              placeholder="Bio here..."
              defaultValue={user.bio || ""}
              readOnly
              style={{
                background: "#fff",
                padding: "10px 16px",
                width: "100%",
                borderRadius: "8px",
                color: "#666",
                boxSizing: "border-box",
                border: "1px solid #e1e8ed",
                fontSize: "14px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                outline: "none",
                marginBottom: "10px",
              }}
            />

            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#000",
              }}
            >
              {posts.length > 1000
                ? `${(posts.length / 1000).toFixed(1)}k`
                : posts.length}{" "}
              posts
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "space-around",
            borderBottom: "1px solid #ccc",
            paddingBottom: "0px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "3px solid #000"
                    : "3px solid transparent",
                padding: "15px 20px",
                fontSize: "18px",
                fontWeight: 600,
                color: activeTab === tab.id ? "#000" : "#999",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          style={{
            marginTop: "40px",
            color: "#536471",
            fontSize: "15px",
            textAlign: "left",
            width: "100%",
          }}
        >
          {activeTab === "posts" && (
            <>
              {posts.length === 0 ? (
                <p>No posts yet.</p>
              ) : (
                <div>
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #e1e8ed",
                        borderRadius: "12px",
                        backgroundColor: "#f7f9fa",
                        marginBottom: "15px",
                      }}
                    >
                      {/* Post Header - Author Info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "12px",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor: "#ccc",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {post.author_profilePicture ? (
                              <img
                                src={`http://localhost:3000${post.author_profilePicture}`}
                                alt={post.author_username}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: "20px" }}>👤</span>
                            )}
                          </div>
                          <div>
                            <p
                              style={{
                                margin: "0",
                                fontWeight: "600",
                                color: "#000",
                              }}
                            >
                              @{post.author_username}
                            </p>
                          </div>
                        </div>
                        <span style={{ color: "#536471", fontSize: "12px" }}>
                          now
                        </span>
                      </div>

                      {/* Post Caption */}
                      <p
                        style={{
                          color: "#000",
                          margin: "0 0 12px 0",
                          fontSize: "15px",
                        }}
                      >
                        {post.caption}
                      </p>

                      {/* Post Image */}
                      {post.image && (
                        <img
                          src={`http://localhost:3000${post.image}`}
                          alt="Post"
                          style={{
                            maxWidth: "100%",
                            borderRadius: "12px",
                            maxHeight: "400px",
                            objectFit: "contain",
                            marginBottom: "12px",
                            width: "100%",
                          }}
                        />
                      )}

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                          {post.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                color: "#1d9bf0",
                                fontSize: "13px",
                                marginRight: "8px",
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {activeTab === "reblogs" && <p>No reblogs yet.</p>}
          {activeTab === "tagged" && <p>No tagged posts yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
