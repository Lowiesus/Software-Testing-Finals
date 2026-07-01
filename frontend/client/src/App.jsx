import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import SignUp from "./screens/general/SignUp";
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
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUManage />} />
          <Route path="/admin/content" element={<AdminCManage />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* User */}
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/edit-profile" element={<EditProfile />} />
          <Route path="/user/library" element={<UserLibrary />} />
          <Route path="/user/settings" element={<UserSettings />} />
          <Route path="/user/explore" element={<UserExplore />} />
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
