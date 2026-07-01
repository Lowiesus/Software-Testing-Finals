import { getDB } from "../config/database.js";
import bcrypt from "bcrypt";

// User Status Constants
export const USER_STATUS = {
  NOT_VERIFIED: "not_verified",
  VERIFIED: "verified",
  BANNED: "banned",
};

export class User {
  static collection() {
    return getDB().collection("users");
  }

  static async findByUsernameOrEmail(identifier) {
    return this.collection().findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
  }

  static async findByEmail(email) {
    return this.collection().findOne({ email });
  }

  static async findByFirebaseUid(firebaseUid) {
    return this.collection().findOne({ firebaseUid });
  }

  static async findById(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = {
      ...data,
      password: hashedPassword,
      role: "user",
      status: USER_STATUS.NOT_VERIFIED, // Default status is not verified
      created_at: new Date(),
    };
    return this.collection().insertOne(user);
  }

  static async update(id, updates) {
    const { ObjectId } = await import("mongodb");

    return this.collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updates },
    );
  }

  static async updateStatus(id, status) {
    const { ObjectId } = await import("mongodb");

    if (!Object.values(USER_STATUS).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    return this.collection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updated_at: new Date(),
        },
      }
    );
  }

  static async isBanned(id) {
    const { ObjectId } = await import("mongodb");
    const user = await this.collection().findOne(
      { _id: new ObjectId(id) },
      { projection: { status: 1 } }
    );
    return user && user.status === USER_STATUS.BANNED;
  }

  static async isVerified(id) {
    const { ObjectId } = await import("mongodb");
    const user = await this.collection().findOne(
      { _id: new ObjectId(id) },
      { projection: { status: 1 } }
    );
    return user && user.status === USER_STATUS.VERIFIED;
  }

  static async delete(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().deleteOne({ _id: new ObjectId(id) });
  }
}
