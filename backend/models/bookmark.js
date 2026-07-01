import { MongoClient } from "mongodb";
import { getDB } from "../config/database.js";

class Bookmark {
  static collection() {
    const db = getDB();
    return db.collection("bookmarks");
  }

  static async createBookmark(postId, userId) {
    const { ObjectId } = await import("mongodb");
    const bookmark = {
      post_id: new ObjectId(postId),
      user_id: new ObjectId(userId),
      created_at: new Date(),
    };
    const result = await this.collection().insertOne(bookmark);
    return { _id: result.insertedId, ...bookmark };
  }

  static async findById(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByPostId(postId) {
    const { ObjectId } = await import("mongodb");
    return this.collection()
      .find({ post_id: new ObjectId(postId) })
      .sort({ created_at: -1 })
      .toArray();
  }

  static async findByUserId(userId, limit = 20, skip = 0) {
    const { ObjectId } = await import("mongodb");
    return this.collection()
      .find({ user_id: new ObjectId(userId) })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  static async countByPostId(postId) {
    const { ObjectId } = await import("mongodb");
    return this.collection().countDocuments({
      post_id: new ObjectId(postId),
    });
  }

  static async countByUserId(userId) {
    const { ObjectId } = await import("mongodb");
    return this.collection().countDocuments({
      user_id: new ObjectId(userId),
    });
  }

  static async deleteBookmark(id) {
    const { ObjectId } = await import("mongodb");
    const result = await this.collection().deleteOne({
      _id: new ObjectId(id),
    });
    return result.deletedCount > 0;
  }

  static async deleteByPostAndUser(postId, userId) {
    const { ObjectId } = await import("mongodb");
    const result = await this.collection().deleteOne({
      post_id: new ObjectId(postId),
      user_id: new ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  static async deleteByPostId(postId) {
    const { ObjectId } = await import("mongodb");
    const result = await this.collection().deleteMany({
      post_id: new ObjectId(postId),
    });
    return result.deletedCount;
  }

  static async isBookmarkedByUser(postId, userId) {
    const { ObjectId } = await import("mongodb");
    const bookmark = await this.collection().findOne({
      post_id: new ObjectId(postId),
      user_id: new ObjectId(userId),
    });
    return !!bookmark;
  }
}

export { Bookmark };
