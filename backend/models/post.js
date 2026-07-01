import { getDB } from "../config/database.js";

// Post Categories
export const POST_CATEGORIES = {
  COSMETICS: "Cosmetics",
  ACCESSORIES: "Accessories",
  CLOTHING: "Clothing",
};

// Post Types
export const POST_TYPES = {
  STANDARD: "Standard Post",
  TUTORIAL: "Tutorial",
};

export class Post {
  static collection() {
    return getDB().collection("posts");
  }

  static async createPost(data) {
    const post = {
      caption: data.caption,
      image: data.image,
      category: data.category,
      post_type: data.post_type || POST_TYPES.STANDARD,
      author_id: data.author_id,
      author_username: data.author_username || "user",
      author_profilePicture: data.author_profilePicture || null,
      tags: data.tags || [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Validate category
    if (!Object.values(POST_CATEGORIES).includes(post.category)) {
      throw new Error(
        `Invalid category. Allowed values: ${Object.values(POST_CATEGORIES).join(", ")}`,
      );
    }

    // Validate post type
    if (!Object.values(POST_TYPES).includes(post.post_type)) {
      throw new Error(
        `Invalid post type. Allowed values: ${Object.values(POST_TYPES).join(", ")}`,
      );
    }

    return this.collection().insertOne(post);
  }

  static async findById(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByAuthorId(authorId) {
    const { ObjectId } = await import("mongodb");
    try {
      console.log(
        "findByAuthorId called with:",
        authorId,
        "type:",
        typeof authorId,
      );

      // Try both: as a string and as ObjectId
      let posts = await this.collection()
        .find({ author_id: authorId })
        .sort({ created_at: -1 })
        .toArray();

      console.log("Found posts (string match):", posts.length);

      // If not found, try as ObjectId
      if (posts.length === 0) {
        try {
          posts = await this.collection()
            .find({ author_id: new ObjectId(authorId) })
            .sort({ created_at: -1 })
            .toArray();
          console.log("Found posts (ObjectId match):", posts.length);
        } catch (e) {
          console.error("Failed to convert to ObjectId:", e.message);
        }
      }

      return posts;
    } catch (err) {
      console.error(
        "Error in findByAuthorId:",
        err.message,
        "authorId:",
        authorId,
      );
      return [];
    }
  }

  static async findByCategory(category) {
    if (!Object.values(POST_CATEGORIES).includes(category)) {
      throw new Error(
        `Invalid category. Allowed values: ${Object.values(POST_CATEGORIES).join(", ")}`,
      );
    }
    return this.collection().find({ category }).toArray();
  }

  static async findByPostType(postType) {
    if (!Object.values(POST_TYPES).includes(postType)) {
      throw new Error(
        `Invalid post type. Allowed values: ${Object.values(POST_TYPES).join(", ")}`,
      );
    }
    return this.collection()
      .find({ post_type: postType })
      .sort({ created_at: -1 })
      .toArray();
  }

  static async findByTag(tag) {
    return this.collection().find({ tags: tag }).toArray();
  }

  static async getAllPosts(limit = 20, skip = 0) {
    return this.collection()
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  static async updatePost(id, updates) {
    const { ObjectId } = await import("mongodb");

    // Don't allow updating author_id or created_at
    delete updates.author_id;
    delete updates.created_at;

    const updateData = {
      ...updates,
      updated_at: new Date(),
    };

    return this.collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );
  }

  static async deletePost(id) {
    const { ObjectId } = await import("mongodb");
    return this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  // Tag operations
  static async addTag(postId, tag) {
    const { ObjectId } = await import("mongodb");

    return this.collection().updateOne(
      { _id: new ObjectId(postId) },
      {
        $addToSet: { tags: tag },
        $set: { updated_at: new Date() },
      },
    );
  }

  static async removeTag(postId, tag) {
    const { ObjectId } = await import("mongodb");

    return this.collection().updateOne(
      { _id: new ObjectId(postId) },
      {
        $pull: { tags: tag },
        $set: { updated_at: new Date() },
      },
    );
  }

  static async searchByCaption(searchTerm) {
    return this.collection()
      .find({
        caption: { $regex: searchTerm, $options: "i" },
      })
      .toArray();
  }
}
