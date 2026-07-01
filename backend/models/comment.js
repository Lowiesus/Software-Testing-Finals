                                 import { getDB } from "../config/database.js";

export class Comment {
  static collection() {
    return getDB().collection("comments");
  }

  static async createComment(data) {
    const comment = {
      post_id: data.post_id, // ObjectId of Post
      author_id: data.author_id, // ObjectId of User
      author_username: data.author_username || "user",
      text: data.text,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return this.collection().insertOne(comment);
  }

  static async findById(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByPostId(postId, limit = 20, skip = 0) {
    const { ObjectId } = await import("mongodb");

    return this.collection()
      .find({ post_id: new ObjectId(postId) })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  static async findByAuthorId(authorId) {
    const { ObjectId } = await import("mongodb");

    return this.collection()
      .find({ author_id: new ObjectId(authorId) })
      .sort({ created_at: -1 })
      .toArray();
  }

  static async countByPostId(postId) {
    const { ObjectId } = await import("mongodb");

    return this.collection().countDocuments({
      post_id: new ObjectId(postId),
    });
  }

  static async updateComment(id, text) {
    const { ObjectId } = await import("mongodb");

    return this.collection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          text,
          updated_at: new Date(),
        },
      }
    );
  }

  static async deleteComment(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async deleteByPostId(postId) {
    const { ObjectId } = await import("mongodb");

    return this.collection().deleteMany({
      post_id: new ObjectId(postId),
    });
  }
}
