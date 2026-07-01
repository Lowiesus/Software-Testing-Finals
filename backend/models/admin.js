import { getDB } from "../config/database.js";
import bcrypt from "bcrypt";

export class Admin {
  static collection() {
    return getDB().collection("admins");
  }

  static async findByEmail(email) {
    return this.collection().findOne({ email });
  }

  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const adminData = {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      full_name: data.full_name || "",
      role: data.role || "admin",
      is_active: data.is_active ?? true,
      created_at: new Date(),
      last_login: data.last_login ?? null,
    };

    return this.collection().insertOne(adminData);
  }

  static async update(id, updates) {
    const { ObjectId } = await import("mongodb");
    return this.collection().updateOne(
      { _id: new ObjectIsd(id) },
      { $set: updates },
    );
  }

  static async findById(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().findOne({ _id: new ObjectId(id) });
  }
}
