import React from "react";
import "./signup.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import eyeVisible from "../../assets/icons/eye-visible.png";
import eyeHidden from "../../assets/icons/eye-hidden.png";
import signupPhoto from "../../assets/model photos/signup-photo.png";
import vivideLogo from "../../assets/icons/vivide logo black.png";
import { auth, provider } from "../../utils/Firebase.js";
import { signInWithPopup } from "firebase/auth";
import { authAPI } from "../../utils/api.js";
import Toast from "../../components/Toast.jsx";
import { getErrorMessage } from "../../utils/helpers.js";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setToast({ message: "", type: "info" });

    if (password !== confirmPassword) {
      setToast({ message: "Passwords do not match.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({ username, email, password });
      setToast({
        message: response.data.message || "Registration successful! Please log in.",
        type: "success",
      });
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setToast({
        message: getErrorMessage(error, "Signup failed"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async () => {
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
        message: backendResponse.data.message || "Google sign-up successful!",
        type: "success",
      });

      navigate("/user/home");
    } catch (error) {
      setToast({
        message: getErrorMessage(error, "Google sign-up failed"),
        type: "error",
      });
    }
  };

  return (
    <div className="signup-page">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
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
