import { supabase } from '../config/database.js';
import { mapBookmark, toDeleteResult } from '../utils/supabaseHelpers.js';

class Bookmark {
  static async createBookmark(postId, userId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        post_id: postId,
        user_id: userId,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapBookmark(data);
  }

  static async findById(id) {
    const { data, error } = await supabase.from('bookmarks').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    return mapBookmark(data);
  }

  static async findByPostId(postId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapBookmark);
  }

  static async findByUserId(userId, limit = 20, skip = 0) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return (data || []).map(mapBookmark);
  }

  static async countByPostId(postId) {
    const { count, error } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  }

  static async countByUserId(userId) {
    const { count, error } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  }

  static async deleteBookmark(id) {
    const { error, count } = await supabase.from('bookmarks').delete({ count: 'exact' }).eq('id', id);

    if (error) throw error;
    return (count || 0) > 0;
  }

  static async deleteByPostAndUser(postId, userId) {
    const { error, count } = await supabase
      .from('bookmarks')
      .delete({ count: 'exact' })
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    return (count || 0) > 0;
  }

  static async deleteByPostId(postId) {
    const { error, count } = await supabase.from('bookmarks').delete({ count: 'exact' }).eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  }

  static async isBookmarkedByUser(postId, userId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }
}

export { Bookmark };
