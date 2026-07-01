import React from "react";
import "./signup.css";
import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import eyeVisible from "../../assets/icons/eye-visible.png";
import eyeHidden from "../../assets/icons/eye-hidden.png";
import signupPhoto from "../../assets/model photos/signup-photo.png";
import vivideLogo from "../../assets/icons/vivide logo black.png";
import { auth, provider } from "../../utils/Firebase.js";
import { signInWithPopup } from "firebase/auth";
import { authAPI } from "../../utils/api.js";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.register({ username, email, password });

      console.log("Signup successful:", response.data);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Backend error response:", error.response.data);
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message || error.response.statusText;
        alert("Signup failed: " + errorMessage);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("Signup failed: No response from server");
      } else {
        console.error("Error message:", error.message);
        alert("Signup failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const firebaseToken = await user.getIdToken();

      console.log("Firebase token obtained, sending to backend...");

      // Send token to your backend
      const backendResponse = await authAPI.googleLogin(firebaseToken);

      console.log("Backend response:", backendResponse.data);

      // Store the JWT token from backend
      localStorage.setItem("accessToken", backendResponse.data.accessToken);
      localStorage.setItem("username", backendResponse.data.username);
      localStorage.setItem("role", backendResponse.data.role);

      // Redirect to home/dashboard
      navigate("/home");
    } catch (error) {
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Backend error response:", error.response.data);
        alert(
          "Login failed: " +
            (error.response.data.message || error.response.statusText)
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("Login failed: No response from server");
      } else {
        console.error("Error message:", error.message);
        alert("Login failed: " + error.message);
      }
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
        <h1>Register Here</h1>
        <div className="signup-container">
          <p className="subtitle">Register to join our community!</p>

          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img
                  src={showPassword ? eyeHidden : eyeVisible}
                  alt={showPassword ? "Hide password" : "Show password"}
                />
              </button>
            </div>

            <div className="password-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <img
                  src={showConfirmPassword ? eyeHidden : eyeVisible}
                  alt={showConfirmPassword ? "Hide password" : "Show password"}
                />
              </button>
            </div>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            className="google-button"
            onClick={() => {
              console.log("Google sign-up");
              googleSignup();
            }}
          >
            <span>Sign in with Google</span>
          </button>

          <p className="login-link">
            Already have an account? <Link to="/login">Login Here</Link>
          </p>

          <footer className="signup-footer">
            Terms of Service | Privacy Policy | Cookie | Policy | Ads info |
            More | © 2026 | hackers-2
          </footer>
        </div>
      </div>
      <div className="signup-right">
        <img src={signupPhoto} alt="Fashion model" className="signup-photo" />
                <Link to="/">
                  <img src={vivideLogo} alt="Vivide logo" className="vivide-logo" />
                </Link>
      </div>
    </div>
  );
}
