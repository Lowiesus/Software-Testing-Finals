import { useState } from "react";
import "./admin.css";

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

  const rows = [
    { key: "userRegistrations", label: "User Registrations" },
    { key: "reblogPosts", label: "Reblog Posts" },
    { key: "postLimit", label: "Post Limit" },
  ];

  return (
    <div className="admin-page">
      <h1>Settings</h1>

      <h2 className="admin-section-title">Platform Control</h2>

      <div>
        {rows.map((row) => (
          <div key={row.key} className="admin-toggle-row">
            <label>{row.label}</label>
            <div
              className={`admin-toggle ${settings[row.key] ? "on" : "off"}`}
              onClick={() => toggleSetting(row.key)}
              onKeyDown={() => toggleSetting(row.key)}
              role="switch"
              aria-checked={settings[row.key]}
              tabIndex={0}
            >
              <div className="admin-toggle-knob" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
