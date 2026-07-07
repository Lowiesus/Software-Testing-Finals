import { useState, useEffect } from "react";
import { adminAPI } from "../../utils/api.js";

const formatCount = (value) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalPosts: 0,
    totalBookmarks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await adminAPI.getStats();
        setStats(response.data.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    { label: "total users", value: formatCount(stats.totalUsers) },
    { label: "new users (30d)", value: formatCount(stats.newUsers) },
    { label: "total posts", value: formatCount(stats.totalPosts) },
    { label: "total bookmarks", value: formatCount(stats.totalBookmarks) },
  ];

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
          marginBottom: "40px",
          marginTop: "0",
        }}
      >
        Dashboard
      </h1>

      {error && (
        <p style={{ color: "#b91c1c", marginBottom: "20px" }}>{error}</p>
      )}

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "30px",
            marginBottom: "60px",
          }}
        >
          {cards.map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "#e5e7eb",
                padding: "30px 20px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: "8px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
