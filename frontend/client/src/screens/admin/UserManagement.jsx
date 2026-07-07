import { useEffect, useMemo, useState } from "react";
import { adminAPI } from "../../utils/api.js";
import "./admin.css";

const STATUS_OPTIONS = [
  { value: "verified", label: "Verified" },
  { value: "not_verified", label: "Not Verified" },
  { value: "banned", label: "Banned" },
];

const AdminUManage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabs = [
    { id: "all", label: "All Users" },
    { id: "verified", label: "Verified Users" },
    { id: "not-verified", label: "Not Verified Users" },
    { id: "banned", label: "Banned Users" },
  ];

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "verified" && user.status === "verified") ||
        (activeTab === "not-verified" && user.status === "not_verified") ||
        (activeTab === "banned" && user.status === "banned");

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, search]);

  const handleStatusChange = async (userId, status) => {
    try {
      if (status === "verified") {
        await adminAPI.verifyUser(userId);
      } else if (status === "banned") {
        await adminAPI.banUser(userId, "Banned by admin");
      } else if (status === "not_verified") {
        await adminAPI.unbanUser(userId);
      } else {
        await adminAPI.updateUserStatus(userId, status);
      }

      await loadUsers();
    } catch (err) {
      console.error("Failed to update user status:", err);
      setError("Failed to update user status.");
    }
  };

  return (
    <div className="admin-page">
      <h1>User Management</h1>

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

      <input
        type="text"
        className="admin-search"
        placeholder="Search Here..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="admin-error">{error}</p>}
      {loading ? (
        <p className="admin-loading">Loading users...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4}>No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={user.status}
                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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

export default AdminUManage;
