import { useEffect, useMemo, useState } from "react";
import { adminAPI } from "../../utils/api.js";

const STATUS_OPTIONS = [
  { value: "verified", label: "Verified" },
  { value: "not_verified", label: "Not Verified" },
  { value: "banned", label: "Banned" },
];

const formatStatus = (status) => {
  if (status === "verified") return "Verified";
  if (status === "banned") return "Banned";
  return "Not Verified";
};

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
        User Management
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

      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search Here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f3f4f6",
            fontSize: "14px",
            color: "#000",
            outline: "none",
          }}
        />
      </div>

      {error && <p style={{ color: "#b91c1c", marginBottom: "16px" }}>{error}</p>}
      {loading ? (
        <p>Loading users...</p>
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
                <th style={{ textAlign: "left", padding: "12px 0" }}>Username</th>
                <th style={{ textAlign: "left", padding: "12px 0" }}>Email Address</th>
                <th style={{ textAlign: "left", padding: "12px 0" }}>Role</th>
                <th style={{ textAlign: "left", padding: "12px 0" }}>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 0", color: "#6b7280" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "16px 0" }}>{user.username}</td>
                    <td style={{ padding: "16px 0" }}>{user.email}</td>
                    <td style={{ padding: "16px 0" }}>{user.role}</td>
                    <td style={{ padding: "16px 0" }}>
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                          backgroundColor: "#fff",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span style={{ marginLeft: "10px", color: "#6b7280" }}>
                        {formatStatus(user.status)}
                      </span>
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
