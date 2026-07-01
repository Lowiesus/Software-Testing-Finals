import { User, USER_STATUS } from "../models/user.js";
import { Admin } from "../models/admin.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as validators from "../utils/validators.js";
import { auth as firebaseAdmin } from "../config/firebase.js";

export async function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
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

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        samSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      });

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

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        samSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      });

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
      samSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { id, role } = req.user;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0)
      return res.status(400).json({ message: "No updates provided" });

    delete updates.role; // Prevent role changes
    delete updates._id; // Prevent ID changes
    delete updates.created_at; // Prevent creation date changes

    const errors = [];

    if (updates.username && !validators.isValidUsername(updates.username))
      errors.push("Invalid username format");

    if (updates.email && !validators.isValidEmail(updates.email))
      errors.push("Invalid email format");

    if (updates.password && !validators.isValidPassword(updates.password))
      errors.push(
        "Password must be at least 8 characters long and include a mix of uppercase, lowercase, and numbers",
      );

    if (errors.length > 0)
      return res.status(400).json({ message: errors.join("; ") });

    if (updates.password)
      updates.password = await bcrypt.hash(updates.password, 10);

    const Model = role.toLowerCase() === "admin" ? Admin : User;
    const result = await Model.update(id, updates);

    if (result.modifiedCount === 0)
      return res.status(404).json({ message: "no changes made" });

    const updatedUser = await Model.findById(id);
    if (updatedUser?.password) {
      delete updatedUser.password;
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

    // Check if Firebase is initialized
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
      // Create a new user if doesn't exist
      const newUser = {
        username: name || email.split("@")[0],
        email,
        firebaseUid: uid,
        profilePicture: picture || null,
        role: "user",
        status: USER_STATUS.NOT_VERIFIED, // New Google users start as not verified
        created_at: new Date(),
        isGoogleUser: true,
      };

      const result = await User.collection().insertOne(newUser);
      user = await User.findById(result.insertedId.toString());
    } else {
      // Check if user is banned
      if (user.status === USER_STATUS.BANNED) {
        return res.status(403).json({
          message: "Your account has been banned. Please contact support.",
        });
      }

      // Link Firebase UID if user exists but wasn't created via Google
      if (!user.firebaseUid) {
        await User.update(user._id.toString(), {
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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      samSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

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

    // Process image with sharp to fix EXIF orientation
    try {
      const UPLOAD_DIR = "./uploads/profiles";
      const fullPath = path.join(UPLOAD_DIR, req.file.filename);
      
      await sharp(fullPath)
        .rotate() // Auto-rotate based on EXIF data
        .toFile(fullPath + ".tmp");
      
      // Replace original with rotated version
      fs.renameSync(fullPath + ".tmp", fullPath);
      console.log("Profile picture processed and EXIF rotation applied");
    } catch (err) {
      console.error("Error processing profile picture with sharp:", err.message);
      // Continue anyway - image processing is not critical
    }

    // Get the relative path from the uploaded file
    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;

    const Model = role.toLowerCase() === "admin" ? Admin : User;
    const result = await Model.update(id, { profilePicture: profilePicturePath });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "User not found" });
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
