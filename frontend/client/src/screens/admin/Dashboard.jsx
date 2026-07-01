import { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [chartData, setChartData] = useState([]);

  // Generate random statistics for user growth
  useEffect(() => {
    const data = Array.from({ length: 60 }, (_, i) => ({
      day: i + 1,
      value: Math.floor(Math.random() * 100) + 20,
    }));
    setChartData(data);
  }, []);

  // Stats cards data
  const stats = [
    { label: "total users", value: "90.5k" },
    { label: "new users", value: "20.4k" },
    { label: "total posts", value: "200k" },
    { label: "total reblogs", value: "28.6k" },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value), 100);

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

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "30px",
          marginBottom: "60px",
        }}
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
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

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid #d1d5db",
          marginBottom: "60px",
        }}
      ></div>

      {/* User Growth Section */}
      <div style={{ marginBottom: "60px" }}>
        <h2
          style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}
        >
          User Growth
        </h2>

        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "16px", fontWeight: "500" }}>
              User Details
            </span>
            <select
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                color: "#000",
              }}
            >
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>
          </div>

          {/* Chart */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-around",
              height: "200px",
              gap: "8px",
              paddingBottom: "20px",
              position: "relative",
            }}
          >
            {/* Y-axis labels */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                paddingRight: "10px",
                fontSize: "12px",
                color: "#9ca3af",
                textAlign: "right",
                width: "50px",
              }}
            >
              <span>100%</span>
              <span>80%</span>
              <span>60%</span>
              <span>40%</span>
              <span>20%</span>
            </div>

            {/* Bars */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                gap: "4px",
                width: "100%",
                paddingLeft: "60px",
              }}
            >
              {chartData.map((point, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "100%",
                    height: `${(point.value / maxValue) * 100}%`,
                    backgroundColor: "#93c5fd",
                    borderRadius: "4px 4px 0 0",
                    position: "relative",
                    minHeight: "4px",
                  }}
                  title={`Day ${point.day}: ${point.value}%`}
                >
                  {point.day === 35 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-25px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      84,284.27
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "60px",
                right: 0,
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "10px",
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              <span>0k</span>
              <span>10k</span>
              <span>15k</span>
              <span>20k</span>
              <span>25k</span>
              <span>30k</span>
              <span>35k</span>
              <span>40k</span>
              <span>45k</span>
              <span>50k</span>
              <span>55k</span>
              <span>60k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid #d1d5db",
          marginBottom: "40px",
        }}
      ></div>

      {/* Announcement Section */}
      <div>
        <h2
          style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}
        >
          Announcement
        </h2>

        <div style={{ display: "flex", gap: "16px" }}>
          <button
            style={{
              padding: "10px 24px",
              borderRadius: "24px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 500,
              color: "#000",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
            }}
          >
            See All
          </button>

          <button
            style={{
              padding: "10px 24px",
              borderRadius: "24px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 500,
              color: "#000",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
            }}
          >
            Create
          </button>

          <button
            style={{
              padding: "10px 24px",
              borderRadius: "24px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 500,
              color: "#000",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
            }}
          >
            Edit
          </button>

          <button
            style={{
              padding: "10px 24px",
              borderRadius: "24px",
              border: "1px solid #ef4444",
              background: "#fff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 500,
              color: "#ef4444",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#fee2e2";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
