import { useEffect, useState } from "react";
import { adminAPI } from "../../utils/api.js";

const AdminCManage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabs = [
    { id: "all", label: "All Posts" },
    { id: "reported", label: "Reported Posts" },
    { id: "banned", label: "Banned Posts" },
  ];

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminAPI.getPosts();
      setPosts(response.data.data || []);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const visiblePosts = posts;

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) {
      return;
    }

    try {
      await adminAPI.deletePost(postId);
      await loadPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post.");
    }
  };

  return (
    <div
      style={{
        padding: "40px 60px 40px 60px",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#fff",
        color: "#000",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "600",
          marginBottom: "50px",
          marginTop: "0",
        }}
      >
        Content Management
      </h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "30px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              paddingBottom: "14px",
              fontSize: "15px",
              cursor: "pointer",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid #fa51a2"
                  : "2px solid transparent",
              color: activeTab === tab.id ? "#000" : "#9ca3af",
              fontWeight: activeTab === tab.id ? "600" : "400",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== "all" && (
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>
          Reported and banned post views are not available yet. Showing all posts instead.
        </p>
      )}

      {error && <p style={{ color: "#b91c1c", marginBottom: "16px" }}>{error}</p>}
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "12px 0" }}>Post Title</th>
                <th style={{ textAlign: "left", padding: "12px 0" }}>Author</th>
                <th style={{ textAlign: "left", padding: "12px 0" }}>Category</th>
                <th style={{ textAlign: "left", padding: "12px 0" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePosts.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 0", color: "#6b7280" }}>
                    No posts found.
                  </td>
                </tr>
              ) : (
                visiblePosts.map((post) => (
                  <tr key={post._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "16px 0" }}>{post.caption}</td>
                    <td style={{ padding: "16px 0" }}>{post.author_username}</td>
                    <td style={{ padding: "16px 0" }}>{post.category}</td>
                    <td style={{ padding: "16px 0" }}>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post._id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #ef4444",
                          backgroundColor: "#fff",
                          color: "#ef4444",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCManage;
