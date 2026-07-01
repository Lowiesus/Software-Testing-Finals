import { MongoClient } from "mongodb";
import { getDB } from "../config/database.js";

class Tag {
  static collection() {
    const db = getDB();
    return db.collection("tags");
  }

  static async createTag(name) {
    const tag = {
      name: name.toLowerCase(),
      post_count: 0,
      created_at: new Date(),
    };
    const result = await this.collection().insertOne(tag);
    return { _id: result.insertedId, ...tag };
  }

  static async findById(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByName(name) {
    return this.collection().findOne({ name: name.toLowerCase() });
  }

  static async getAllTags(limit = 50, skip = 0) {
    return this.collection()
      .find({})
      .sort({ post_count: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  static async searchTags(query, limit = 20) {
    return this.collection()
      .find({ name: { $regex: query.toLowerCase(), $options: "i" } })
      .sort({ post_count: -1 })
      .limit(limit)
      .toArray();
  }

  static async incrementPostCount(tagName) {
    const result = await this.collection().updateOne(
      { name: tagName.toLowerCase() },
      { $inc: { post_count: 1 } },
    );
    if (result.matchedCount === 0) {
      return this.createTag(tagName);
    }
    return this.findByName(tagName);
  }

  static async decrementPostCount(tagName) {
    const result = await this.collection().updateOne(
      { name: tagName.toLowerCase() },
      { $inc: { post_count: -1 } },
    );
    return result.modifiedCount > 0;
  }

  static async deleteTag(id) {
    const { ObjectId } = await import("mongodb");
    const result = await this.collection().deleteOne({
      _id: new ObjectId(id),
    });
    return result.deletedCount > 0;
  }

  static async deleteByName(name) {
    const result = await this.collection().deleteOne({
      name: name.toLowerCase(),
    });
    return result.deletedCount > 0;
  }
}

export { Tag };
