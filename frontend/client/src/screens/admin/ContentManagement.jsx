import { useEffect, useState } from "react";
import { adminAPI } from "../../utils/api.js";
import "./admin.css";

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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;

    try {
      await adminAPI.deletePost(postId);
      await loadPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post.");
    }
  };

  return (
    <div className="admin-page">
      <h1>Content Management</h1>

      <div className="admin-pill-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-pill-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== "all" && (
        <p className="admin-loading">
          Reported and banned post filters are not available yet. Showing all posts.
        </p>
      )}

      {error && <p className="admin-error">{error}</p>}
      {loading ? (
        <p className="admin-loading">Loading posts...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Post Title</th>
                <th>Author By</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4}>No posts found.</td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id}>
                    <td>{post.caption}</td>
                    <td>{post.author_username}</td>
                    <td>{post.category}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => handleDeletePost(post._id)}
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
