import { useState } from "react";

const AdminUManage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Users" },
    { id: "verified", label: "Verified Users" },
    { id: "not-verified", label: "Not Verified Users" },
    { id: "banned", label: "Banned Users" },
  ];

  const users = [
    {
      username: "username",
      email: "username@gmail.com",
      posts: "13.0K",
      followers: "19.0K",
      status: "Verified",
    },
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
          marginBottom: "50px",
          marginTop: "0",
        }}
      >
        User Management
      </h1>

      {/* Tabs */}
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

      {/* Search Bar */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search Here..."
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

      {/* Table */}
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
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 0",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Username
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 0",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Email Address
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 0",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Posts
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 0",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Followers
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 0",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Account Status
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <td
                  style={{
                    padding: "16px 0",
                    color: "#374151",
                  }}
                >
                  {user.username}
                </td>
                <td
                  style={{
                    padding: "16px 0",
                    color: "#374151",
                  }}
                >
                  {user.email}
                </td>
                <td
                  style={{
                    padding: "16px 0",
                    color: "#374151",
                  }}
                >
                  {user.posts}
                </td>
                <td
                  style={{
                    padding: "16px 0",
                    color: "#374151",
                  }}
                >
                  {user.followers}
                </td>
                <td
                  style={{
                    padding: "16px 0",
                  }}
                >
                  <select
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                    defaultValue={user.status}
                  >
                    <option value="Verified">Verified</option>
                    <option value="Not Verified">Not Verified</option>
                    <option value="Banned">Banned</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUManage;
