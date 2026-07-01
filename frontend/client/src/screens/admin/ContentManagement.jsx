import { useState } from "react";

const AdminCManage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Posts" },
    { id: "reported", label: "Reported Posts" },
    { id: "banned", label: "Banned Posts" },
  ];

  const posts = [
    {
      title: "title of thy post post",
      author: "username",
      views: "19.0K",
      status: "Published",
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
        Content Management
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
                Post Title
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 0",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Author By
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 0",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Views
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 0",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, idx) => (
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
                  {post.title}
                </td>
                <td
                  style={{
                    padding: "16px 0",
                    color: "#374151",
                  }}
                >
                  {post.author}
                </td>
                <td
                  style={{
                    padding: "16px 0",
                    color: "#374151",
                  }}
                >
                  {post.views}
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
                    defaultValue={post.status}
                  >
                    <option value="Published">Published</option>
                    <option value="Reported">Reported</option>
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

export default AdminCManage;
