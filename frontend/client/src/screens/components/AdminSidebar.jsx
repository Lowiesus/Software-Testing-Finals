import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  return (
    <>
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

          <NavLink
            to="/admin/logout"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Log Out
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
