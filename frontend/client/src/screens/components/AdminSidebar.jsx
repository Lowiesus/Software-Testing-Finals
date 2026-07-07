import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authAPI } from "../../utils/api.js";
import { getAssetUrl } from "../../utils/constants.js";
import "./AdminSidebar.css";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "🏠", color: "#22c55e" },
  { to: "/admin/users", label: "Users", icon: "👤", color: "#3b82f6" },
  { to: "/admin/content", label: "Content", icon: "📚", color: "#f97316" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️", color: "#a855f7" },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const response = await authAPI.getProfile();
        setAdminUser(response.data.user);
      } catch (error) {
        console.error("Failed to load admin profile:", error);
      }
    };

    loadAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-brand">
        <h2 className="admin-logo">Vivide</h2>
        <span className="admin-badge">ADMIN</span>
      </div>

      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="admin-nav-icon" style={{ color: item.color }}>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}

        <button type="button" className="admin-nav-link admin-logout" onClick={handleLogout}>
          <span className="admin-nav-icon">↪</span>
          Log Out
        </button>
      </nav>

      <div className="admin-profile-footer">
        <div className="admin-profile-avatar">
          {adminUser?.profilePicture ? (
            <img src={getAssetUrl(adminUser.profilePicture)} alt={adminUser.username} />
          ) : (
            <span>👤</span>
          )}
        </div>
        <span>@{adminUser?.username || localStorage.getItem("username") || "admin"}</span>
      </div>
    </div>
  );
};

export default AdminSidebar;
