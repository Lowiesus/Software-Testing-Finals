import { useState } from "react";

const UserSettings = () => {
  const [contentType, setContentType] = useState("videos");

  return (
    <div
      style={{
        padding: "60px 20px",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#fff",
        color: "#000",
        boxSizing: "border-box",
        marginLeft: "-100px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "600",
            marginBottom: "40px",
            color: "#000",
          }}
        >
          Settings
        </h1>

        {/* What do you want to see? */}
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "500",
              marginBottom: "20px",
              color: "#000",
            }}
          >
            What do you want to see?
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              <input
                type="radio"
                name="contentType"
                value="all"
                checked={contentType === "all"}
                onChange={(e) => setContentType(e.target.value)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              All kinds of posts
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              <input
                type="radio"
                name="contentType"
                value="videos"
                checked={contentType === "videos"}
                onChange={(e) => setContentType(e.target.value)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              Videos only
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              <input
                type="radio"
                name="contentType"
                value="articles"
                checked={contentType === "articles"}
                onChange={(e) => setContentType(e.target.value)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              Articles only
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
