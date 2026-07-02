import { supabase } from '../config/database.js';
import { mapLike, toDeleteResult } from '../utils/supabaseHelpers.js';

class Like {
  static async createLike(postId, userId) {
    const { data, error } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: userId,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapLike(data);
  }

  static async findById(id) {
    const { data, error } = await supabase.from('likes').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    return mapLike(data);
  }

  static async findByPostId(postId) {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapLike);
  }

  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapLike);
  }

  static async countByPostId(postId) {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  }

  static async countByUserId(userId) {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  }

  static async deleteLike(id) {
    const { error, count } = await supabase.from('likes').delete({ count: 'exact' }).eq('id', id);

    if (error) throw error;
    return (count || 0) > 0;
  }

  static async deleteByPostAndUser(postId, userId) {
    const { error, count } = await supabase
      .from('likes')
      .delete({ count: 'exact' })
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    return (count || 0) > 0;
  }

  static async deleteByPostId(postId) {
    const { error, count } = await supabase.from('likes').delete({ count: 'exact' }).eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  }

  static async isLikedByUser(postId, userId) {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }
}

export { Like };
