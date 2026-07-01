import { useState } from "react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    userRegistrations: true,
    reblogPosts: true,
    postLimit: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
        Settings
      </h1>

      {/* Platform Control Section */}
      <div>
        <h2
          style={{ fontSize: "20px", fontWeight: "600", marginBottom: "30px" }}
        >
          Platform Control
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* User Registrations Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "20px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <label
              style={{ fontSize: "15px", fontWeight: "500", color: "#111827" }}
            >
              User Registrations
            </label>
            <div
              onClick={() => toggleSetting("userRegistrations")}
              style={{
                width: "48px",
                height: "28px",
                borderRadius: "14px",
                backgroundColor: settings.userRegistrations
                  ? "#000"
                  : "#d1d5db",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: settings.userRegistrations
                  ? "flex-end"
                  : "flex-start",
                padding: "4px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
          </div>

          {/* Reblog Posts Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "20px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <label
              style={{ fontSize: "15px", fontWeight: "500", color: "#111827" }}
            >
              Reblog Posts
            </label>
            <div
              onClick={() => toggleSetting("reblogPosts")}
              style={{
                width: "48px",
                height: "28px",
                borderRadius: "14px",
                backgroundColor: settings.reblogPosts ? "#000" : "#d1d5db",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: settings.reblogPosts
                  ? "flex-end"
                  : "flex-start",
                padding: "4px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
          </div>

          {/* Post Limit Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "20px",
            }}
          >
            <label
              style={{ fontSize: "15px", fontWeight: "500", color: "#111827" }}
            >
              Post Limit
            </label>
            <div
              onClick={() => toggleSetting("postLimit")}
              style={{
                width: "48px",
                height: "28px",
                borderRadius: "14px",
                backgroundColor: settings.postLimit ? "#000" : "#d1d5db",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: settings.postLimit ? "flex-end" : "flex-start",
                padding: "4px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
