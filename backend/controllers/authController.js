import { User, USER_STATUS } from "../models/user.js";
import { Admin } from "../models/admin.js";
import { Post } from "../models/post.js";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as validators from "../utils/validators.js";
import { getFirebaseAuth } from "../config/firebase.js";
import { getProfileUploadDir } from "../utils/uploadPaths.js";
import { uploadImageFile, deleteImageByUrl } from "../utils/storage.js";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function generateTokens(user) {
  const userId = String(user._id);

  const accessToken = jwt.sign(
    { id: userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: userId, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const errors = [];

    if (!validators.isValidUsername(username))
      errors.push("Username must be 3–20 letters/numbers");

    if (!validators.isValidEmail(email)) errors.push("Invalid email format");

    if (!validators.isValidPassword(password))
      errors.push(
        "Password must be at least 8 chars, include uppercase, lowercase, number",
      );

    if (errors.length > 0) return res.status(400).json({ message: errors });

    const existing = await User.findByUsernameOrEmail(email);
    if (existing)
      return res
        .status(400)
        .json({ message: "Username or email already exists" });

    await User.createUser({
      username,
      email,
      password,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const admin = await Admin.findByEmail(email);
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const { accessToken, refreshToken } = await generateTokens({
        _id: admin._id,
        role: "admin",
        admin_id: admin._id,
      });

      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

      return res.status(200).json({
        message: "admin Login successful",
        username: admin.username,
        accessToken,
        role: "admin",
      });
    }

    const user = await User.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if user is banned
      if (user.status === USER_STATUS.BANNED) {
        return res.status(403).json({
          message: "Your account has been banned. Please contact support.",
        });
      }

      const { accessToken, refreshToken } = await generateTokens({
        _id: user._id,
        role: "user",
      });

      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

      return res.status(200).json({
        message: "User Login successful",
        username: user.username,
        accessToken,
        role: "user",
        status: user.status,
      });
    }
    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(400).json({ message: "Invalid user data in token" });
    }

    const { id, role } = req.user;

    const Model = role.toLowerCase() === "admin" ? Admin : User;
    const user = await Model.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userData } = user;

    res.status(200).json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, user) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const newAcessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      res.status(200).json({ accessToken: newAcessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { id, role } = req.user;
    const body = req.body || {};

    const sanitized = {};
    if (body.username !== undefined) sanitized.username = body.username;
    if (body.email !== undefined) sanitized.email = body.email;
    if (body.password !== undefined && body.password) sanitized.password = body.password;
    if (body.profilePicture !== undefined) sanitized.profilePicture = body.profilePicture;

    if (role.toLowerCase() !== "admin" && body.bio !== undefined) {
      sanitized.bio = String(body.bio).trim().slice(0, 160);
    }

    if (Object.keys(sanitized).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const errors = [];

    if (sanitized.username && !validators.isValidUsername(sanitized.username))
      errors.push("Invalid username format");

    if (sanitized.email && !validators.isValidEmail(sanitized.email))
      errors.push("Invalid email format");

    if (sanitized.password && !validators.isValidPassword(sanitized.password))
      errors.push(
        "Password must be at least 8 characters long and include a mix of uppercase, lowercase, and numbers",
      );

    if (errors.length > 0)
      return res.status(400).json({ message: errors.join("; ") });

    if (sanitized.password)
      sanitized.password = await bcrypt.hash(sanitized.password, 10);

    const Model = role.toLowerCase() === "admin" ? Admin : User;
    const result = await Model.update(id, sanitized);

    if (result.modifiedCount === 0) {
      const existingUser = await Model.findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    if (role.toLowerCase() !== "admin") {
      const postUpdates = {};
      if (sanitized.username) postUpdates.username = sanitized.username;
      if (sanitized.profilePicture) postUpdates.profilePicture = sanitized.profilePicture;
      if (Object.keys(postUpdates).length > 0) {
        await Post.updateAuthorPosts(id, postUpdates);
      }
    }

    const updatedUser = await Model.findById(id);
    if (updatedUser?.password) {
      delete updatedUser.password;
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);

    const message = error.message || "Server error";
    const isMissingBioColumn =
      message.includes("bio") &&
      (message.includes("column") ||
        message.includes("schema cache") ||
        error.code === "PGRST204");

    if (isMissingBioColumn) {
      return res.status(400).json({
        message:
          "Bio is not enabled in the database yet. Run backend/supabase/migrations.sql in the Supabase SQL Editor.",
      });
    }

    res.status(500).json({ message: "Server error", error: message });
  }
}

export async function deleteProfile(req, res) {
  try {
    const { id, role } = req.user;

    const Model = role.toLowerCase() === "admin" ? Admin : User;

    const result = await Model.delete(id);

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function googleLogin(req, res) {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    const firebaseAdmin = await getFirebaseAuth();

    if (!firebaseAdmin) {
      console.error("Firebase Admin not initialized");
      return res.status(500).json({
        message:
          "Firebase is not configured. Please add FIREBASE_SERVICE_ACCOUNT to .env",
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await firebaseAdmin.verifyIdToken(firebaseToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists in MongoDB
    let user = await User.findByEmail(email);

    if (!user) {
      const result = await User.createGoogleUser({
        username: name || email.split('@')[0],
        email,
        firebaseUid: uid,
        profilePicture: picture || null,
        status: USER_STATUS.NOT_VERIFIED,
      });
      user = await User.findById(result.insertedId);
    } else {
      // Check if user is banned
      if (user.status === USER_STATUS.BANNED) {
        return res.status(403).json({
          message: "Your account has been banned. Please contact support.",
        });
      }

      // Link Firebase UID if user exists but wasn't created via Google
      if (!user.firebaseUid) {
        await User.update(user._id, {
          firebaseUid: uid,
          isGoogleUser: true,
          profilePicture: picture || user.profilePicture || null,
        });
        user.firebaseUid = uid;
      }
    }

    // Generate your JWT tokens
    const { accessToken, refreshToken } = await generateTokens({
      _id: user._id,
      role: "user",
    });

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      message: "Google login successful",
      username: user.username,
      email: user.email,
      accessToken,
      role: "user",
      status: user.status,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({
      message: "Firebase token verification failed",
      error: error.message,
    });
  }
}

export async function uploadProfilePicture(req, res) {
  try {
    const { id, role } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fullPath = path.join(getProfileUploadDir(), req.file.filename);

    try {
      const sharp = (await import("sharp")).default;
      await sharp(fullPath).rotate().toFile(`${fullPath}.tmp`);
      fs.renameSync(`${fullPath}.tmp`, fullPath);
    } catch (err) {
      console.error("Error processing profile picture with sharp:", err.message);
    }

    let profilePicturePath;
    try {
      profilePicturePath = await uploadImageFile(req.file, "profiles");
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (storageError) {
      console.error("Supabase storage upload failed, using local path:", storageError.message);
      profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    }

    const Model = role.toLowerCase() === "admin" ? Admin : User;
    const existingUser = await Model.findById(id);
    if (existingUser?.profilePicture?.startsWith("http")) {
      await deleteImageByUrl(existingUser.profilePicture);
    }

    const result = await Model.update(id, { profilePicture: profilePicturePath });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role.toLowerCase() !== "admin") {
      await Post.updateAuthorPosts(id, { profilePicture: profilePicturePath });
    }

    const updatedUser = await Model.findById(id);
    if (updatedUser?.password) {
      delete updatedUser.password;
    }

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function searchUsers(req, res) {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.searchByUsername(q.trim());
    const sanitizedUsers = users.map(({ password, email, ...user }) => user);

    res.status(200).json({ data: sanitizedUsers, count: sanitizedUsers.length });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.status === USER_STATUS.BANNED) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, email, ...publicUser } = user;

    res.status(200).json({ user: publicUser });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
