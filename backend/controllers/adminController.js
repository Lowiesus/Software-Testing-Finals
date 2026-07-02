import { Admin } from "../models/admin.js";
import { User, USER_STATUS } from "../models/user.js";
import * as validators from "../utils/validators.js";

// Seed in first admin account
export async function seedAdmin() {
  const existing = await Admin.findByEmail(process.env.ADMIN_EMAIL);
  if (!existing) {
    await Admin.create({
      username: "admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
      is_active: true,
      last_login: null,
    });
    console.log("First admin account created");
  }
}

export async function createAdmin(req, res) {
  try {
    const { username, email, password, full_name } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!validators.isValidUsername(username)) {
      return res.status(400).json({
        message: "Username must be 3-20 letters/numbers",
      });
    }

    if (!validators.isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validators.isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, and a number",
      });
    }

    const existing = await Admin.findByEmail(email);
    if (existing) {
      return res.status(400).json({
        message: "Admin with this email already exists",
      });
    }

    await Admin.create({
      username,
      email,
      password,
      role: "admin",
      is_active: true,
      last_login: null,
    });

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAllAdmins(req, res) {
  try {
    const admins = await Admin.getAll();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userData } = user;

    res.status(200).json(userData);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
export async function getAllUsers(req, res) {
  try {
    const users = await User.getAll();

    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!Object.values(USER_STATUS).includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${Object.values(USER_STATUS).join(", ")}`,
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.updateStatus(id, status);

    res.status(200).json({
      message: `User status updated to ${status}`,
      userId: id,
      newStatus: status,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function verifyUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.updateStatus(id, USER_STATUS.VERIFIED);

    res.status(200).json({
      message: "User verified successfully",
      userId: id,
    });
  } catch (error) {
    console.error("Verify user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function banUser(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.update(id, {
      status: USER_STATUS.BANNED,
      banned_at: new Date(),
      ban_reason: reason || null,
    });

    res.status(200).json({
      message: "User banned successfully",
      userId: id,
      reason: reason || null,
    });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function unbanUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.update(id, {
      status: USER_STATUS.NOT_VERIFIED,
      banned_at: null,
      ban_reason: null,
    });

    res.status(200).json({
      message: "User unbanned successfully",
      userId: id,
    });
  } catch (error) {
    console.error("Unban user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}