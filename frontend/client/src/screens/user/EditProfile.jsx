import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, getAssetUrl } from "../../utils/constants.js";

const EditProfile = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user profile on component mount
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setMessage("No authentication token found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/authentication/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const user = response.data.user;
      setForm({
        username: user.username || "",
        email: user.email || "",
        password: "",
      });
      if (user.profilePicture) {
        setProfilePicture(getAssetUrl(user.profilePicture));
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load profile";
      setMessage(errorMsg);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      const response = await axios.post(
        `${API_BASE_URL}/authentication/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      setProfilePicture(
        getAssetUrl(response.data.user.profilePicture),
      );
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage("Profile picture uploaded successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setMessage(
        error.response?.data?.message || "Error uploading profile picture",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.patch(
        `${API_BASE_URL}/authentication/users/me`,
        {
          username: form.username,
          email: form.email,
          ...(form.password && { password: form.password }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update localStorage with new username
      if (form.username) {
        localStorage.setItem("username", form.username);
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent("usernameUpdated", { detail: form.username }));
      }
      
      setMessage("Profile updated successfully!");
      setForm({ ...form, password: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(error.response?.data?.message || "Error updating profile");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f9fafb",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: "30px", textAlign: "center" }}>
          Edit Profile
        </h2>

        {/* Profile Picture Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "30px",
            gap: "15px",
          }}
        >
          {/* Current Profile Picture */}
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "3px solid #f3f4f6",
            }}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span style={{ fontSize: "48px" }}>👤</span>
            )}
          </div>

          {/* Preview of selected image */}
          {previewUrl && (
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #FA51A2",
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* File Input */}
          <label
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid #FA51A2",
              background: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              color: "#FA51A2",
            }}
          >
            Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </label>

          {/* Upload Button */}
          {selectedFile && (
            <button
              onClick={handleUploadProfilePicture}
              disabled={uploading}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: "#FA51A2",
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: 500,
                color: "#fff",
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? "Uploading..." : "Upload Picture"}
            </button>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="password"
            type="password"
            placeholder="New Password (leave blank to keep current)"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
          />

          {/* Message */}
          {message && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: message.includes("success")
                  ? "#d4edda"
                  : "#f8d7da",
                color: message.includes("success") ? "#155724" : "#721c24",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: "10px",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "#FA51A2",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  fontSize: "14px",
};

export default EditProfile;
