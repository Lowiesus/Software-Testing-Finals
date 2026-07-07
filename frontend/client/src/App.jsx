import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute.jsx";

import SignUp from "./screens/general/Signup";
import LogIn from "./screens/general/Login";
import Landing from "./screens/general/Landing";

import Sidebar from "./screens/components/Sidebar";
import AdminSidebar from "./screens/components/AdminSidebar";
import AdminDashboard from "./screens/admin/Dashboard";
import AdminUManage from "./screens/admin/UserManagement";
import AdminCManage from "./screens/admin/ContentManagement";
import AdminSettings from "./screens/admin/Settings";

import UserHome from "./screens/user/Home";
import EditProfile from "./screens/user/EditProfile";
import UserProfile from "./screens/user/Profile";
import UserLibrary from "./screens/user/Library";
import UserSettings from "./screens/user/Settings";
import UserExplore from "./screens/user/Explore";


function AppContent() {
  const location = useLocation();

  const showUserSidebar = location.pathname.startsWith("/user");
  const showAdminSidebar = location.pathname.startsWith("/admin");

  return (
    <>
      {showUserSidebar && <Sidebar />}
      {showAdminSidebar && <AdminSidebar />}

      <div
        className="main-content"
        style={{
          marginLeft: showUserSidebar
            ? "260px"
            : showAdminSidebar
              ? "220px"
              : "0",
          marginRight: showUserSidebar ? "280px" : "0",
        }}
      >
        <Routes>
          {/* General */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<GuestRoute><SignUp /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><LogIn /></GuestRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUManage /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute requiredRole="admin"><AdminCManage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

          {/* User */}
          <Route path="/user/home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/user/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/user/library" element={<ProtectedRoute><UserLibrary /></ProtectedRoute>} />
          <Route path="/user/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
          <Route path="/user/explore" element={<ProtectedRoute><UserExplore /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
