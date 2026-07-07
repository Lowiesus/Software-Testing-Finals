import React from "react";
import "./login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import eyeVisible from "../../assets/icons/eye-visible.png";
import eyeHidden from "../../assets/icons/eye-hidden.png";
import loginPhoto from "../../assets/model photos/login-photo.png";
import vivideLogo from "../../assets/icons/vivide logo black.png";
import { auth, provider } from "../../utils/Firebase.js";
import { signInWithPopup } from "firebase/auth";
import { authAPI } from "../../utils/api.js";
import Toast from "../../components/Toast.jsx";
import { getErrorMessage } from "../../utils/helpers.js";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const navigate = useNavigate();

  const redirectAfterLogin = (role) => {
    navigate(role === "admin" ? "/admin/dashboard" : "/user/home");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: "", type: "info" });

    try {
      const response = await authAPI.login({ email, password });

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("email", email);
      }

      setToast({
        message: response.data.message || "Login successful!",
        type: "success",
      });

      redirectAfterLogin(response.data.role);
    } catch (error) {
      setToast({
        message: getErrorMessage(error, "Login failed"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setToast({ message: "", type: "info" });

    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const firebaseToken = await user.getIdToken();
      const backendResponse = await authAPI.googleLogin(firebaseToken);

      localStorage.setItem("accessToken", backendResponse.data.accessToken);
      localStorage.setItem("username", backendResponse.data.username);
      localStorage.setItem("role", backendResponse.data.role);

      setToast({
        message: backendResponse.data.message || "Google login successful!",
        type: "success",
      });

      redirectAfterLogin(backendResponse.data.role);
    } catch (error) {
      setToast({
        message: getErrorMessage(error, "Google login failed"),
        type: "error",
      });
    }
  };

  return (
    <div className="login-page">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
      <div className="login-left">
        <Link to="/">
          <img src={vivideLogo} alt="Vivide logo" className="vivide-logo" />
        </Link>
        <img src={loginPhoto} alt="Fashion model" className="login-photo" />
      </div>
      <div className="login-right">
        <h1>WELCOME BACK!</h1>
        <div className="login-container">
          <p className="subtitle">Login to continue where you left off</p>

          <form onSubmit={handleLogin}>
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

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            className="google-button"
            onClick={() => {
              console.log("Google sign-in");
              googleLogin();
            }}
          >
            <span>Sign in with Google</span>
          </button>

          <p className="register-link">
            Don't have an account? <Link to="/register">Register Here</Link>
          </p>

          <footer className="login-footer">
            Terms of Service | Privacy Policy | Cookie | Policy | Ads info |
            More | © 2026 | hackers-2
          </footer>
        </div>
      </div>
    </div>
  );
}
