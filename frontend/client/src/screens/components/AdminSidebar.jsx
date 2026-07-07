import { NavLink, useNavigate } from "react-router-dom";
import { authAPI } from "../../utils/api.js";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();

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
      <h2 className="admin-logo">Vivide</h2>

      <nav>
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          Users
        </NavLink>

        <NavLink
          to="/admin/content"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          Content
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            isActive ? "admin-nav-link active" : "admin-nav-link"
          }
        >
          Settings
        </NavLink>

        <button type="button" className="admin-nav-link admin-logout" onClick={handleLogout}>
          Log Out
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
