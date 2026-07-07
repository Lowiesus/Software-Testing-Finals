import { supabase } from '../config/database.js';
import { mapPost, mapPosts, toDeleteResult, toInsertResult, toUpdateResult } from '../utils/supabaseHelpers.js';

export const POST_CATEGORIES = {
  COSMETICS: 'Cosmetics',
  ACCESSORIES: 'Accessories',
  CLOTHING: 'Clothing',
};

export const POST_TYPES = {
  STANDARD: 'Standard Post',
  TUTORIAL: 'Tutorial',
};

export class Post {
  static async createPost(data) {
    const post = {
      caption: data.caption,
      image: data.image,
      category: data.category,
      post_type: data.post_type || POST_TYPES.STANDARD,
      author_id: data.author_id,
      author_username: data.author_username || 'user',
      author_profile_picture: data.author_profilePicture || null,
      tags: data.tags || [],
    };

    if (!Object.values(POST_CATEGORIES).includes(post.category)) {
      throw new Error(
        `Invalid category. Allowed values: ${Object.values(POST_CATEGORIES).join(', ')}`,
      );
    }

    if (!Object.values(POST_TYPES).includes(post.post_type)) {
      throw new Error(
        `Invalid post type. Allowed values: ${Object.values(POST_TYPES).join(', ')}`,
      );
    }

    const { data: created, error } = await supabase.from('posts').insert(post).select('*').single();

    if (error) throw error;
    return toInsertResult(created);
  }

  static async findById(id) {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    return mapPost(data);
  }

  static async findByAuthorId(authorId) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return mapPosts(data);
  }

  static async findByCategory(category) {
    if (!Object.values(POST_CATEGORIES).includes(category)) {
      throw new Error(
        `Invalid category. Allowed values: ${Object.values(POST_CATEGORIES).join(', ')}`,
      );
    }

    const { data, error } = await supabase.from('posts').select('*').eq('category', category);

    if (error) throw error;
    return mapPosts(data);
  }

  static async findByPostType(postType) {
    if (!Object.values(POST_TYPES).includes(postType)) {
      throw new Error(
        `Invalid post type. Allowed values: ${Object.values(POST_TYPES).join(', ')}`,
      );
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('post_type', postType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return mapPosts(data);
  }

  static async findByTag(tag) {
    const { data, error } = await supabase.from('posts').select('*').contains('tags', [tag]);

    if (error) throw error;
    return mapPosts(data);
  }

  static async getAllPosts(limit = 20, skip = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return mapPosts(data);
  }

  static async updatePost(id, updates) {
    delete updates.author_id;
    delete updates.created_at;

    const dbUpdates = {
      updated_at: new Date().toISOString(),
    };

    if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.post_type !== undefined) dbUpdates.post_type = updates.post_type;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.author_profilePicture !== undefined) {
      dbUpdates.author_profile_picture = updates.author_profilePicture;
    }

    const { data, error } = await supabase.from('posts').update(dbUpdates).eq('id', id).select('*').maybeSingle();

    if (error) throw error;
    return toUpdateResult(data);
  }

  static async deletePost(id) {
    const { error, count } = await supabase.from('posts').delete({ count: 'exact' }).eq('id', id);

    if (error) throw error;
    return toDeleteResult(count);
  }

  static async addTag(postId, tag) {
    const post = await this.findById(postId);
    if (!post) return toUpdateResult(null);

    const tags = Array.from(new Set([...(post.tags || []), tag]));

    return this.updatePost(postId, { tags });
  }

  static async removeTag(postId, tag) {
    const post = await this.findById(postId);
    if (!post) return toUpdateResult(null);

    const tags = (post.tags || []).filter((item) => item !== tag);

    return this.updatePost(postId, { tags });
  }

  static async searchByCaption(searchTerm) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .ilike('caption', `%${searchTerm}%`);

    if (error) throw error;
    return mapPosts(data);
  }

  static async updateAuthorPosts(authorId, updates) {
    const dbUpdates = {
      updated_at: new Date().toISOString(),
    };

    if (updates.username !== undefined) dbUpdates.author_username = updates.username;
    if (updates.profilePicture !== undefined) {
      dbUpdates.author_profile_picture = updates.profilePicture;
    }

    const { error } = await supabase.from('posts').update(dbUpdates).eq('author_id', authorId);
    if (error) throw error;
  }
}
