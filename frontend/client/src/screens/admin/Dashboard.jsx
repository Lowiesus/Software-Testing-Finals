import { useEffect, useState } from "react";
import { adminAPI } from "../../utils/api.js";
import "./admin.css";

const formatCount = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalPosts: 0,
    totalReblogs: 0,
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
    { label: "total users", value: formatCount(stats.totalUsers), color: "purple" },
    { label: "new users (30d)", value: formatCount(stats.newUsers), color: "orange" },
    { label: "total posts", value: formatCount(stats.totalPosts), color: "green" },
    { label: "total reblogs", value: formatCount(stats.totalReblogs), color: "blue" },
  ];

  const chartData = Array.from({ length: 12 }, (_, index) => ({
    label: `${(index + 1) * 5}k`,
    value: 20 + Math.round((stats.totalUsers / 12) * (index + 1) * 0.4),
  }));

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p className="admin-loading">Loading dashboard...</p>
      ) : (
        <>
          <div className="admin-stats-grid">
            {cards.map((stat) => (
              <div key={stat.label} className={`admin-stat-card ${stat.color}`}>
                <div className="admin-stat-value">{stat.value}</div>
                <div className="admin-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="admin-divider" />

          <div>
            <h2 className="admin-section-title">User Growth</h2>
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <span>User Details</span>
                <select>
                  <option>October</option>
                  <option>November</option>
                  <option>December</option>
                </select>
              </div>
              <div className="admin-chart-bars">
                {chartData.map((point) => (
                  <div
                    key={point.label}
                    className="admin-chart-bar"
                    style={{ height: `${Math.min(point.value, 100)}%` }}
                    title={point.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="admin-divider" />

          <div>
            <h2 className="admin-section-title">Announcement</h2>
            <div className="admin-announcement-actions">
              <button type="button">See All</button>
              <button type="button">Create</button>
              <button type="button">Edit</button>
              <button type="button" className="danger">Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
