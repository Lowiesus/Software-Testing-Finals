import { supabase } from '../config/database.js';
import { mapReblog, toDeleteResult } from '../utils/supabaseHelpers.js';

class Reblog {
  static async createReblog(postId, userId) {
    const { data, error } = await supabase
      .from('reblogs')
      .insert({
        post_id: postId,
        user_id: userId,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapReblog(data);
  }

  static async findByUserId(userId, limit = 20, skip = 0) {
    const { data, error } = await supabase
      .from('reblogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return (data || []).map(mapReblog);
  }

  static async countByPostId(postId) {
    const { count, error } = await supabase
      .from('reblogs')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  }

  static async countByUserId(userId) {
    const { count, error } = await supabase
      .from('reblogs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  }

  static async deleteByPostAndUser(postId, userId) {
    const { error, count } = await supabase
      .from('reblogs')
      .delete({ count: 'exact' })
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    return (count || 0) > 0;
  }

  static async deleteByPostId(postId) {
    const { error, count } = await supabase.from('reblogs').delete({ count: 'exact' }).eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  }

  static async isRebloggedByUser(postId, userId) {
    const { data, error } = await supabase
      .from('reblogs')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  static async countAll() {
    const { count, error } = await supabase
      .from('reblogs')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
}

export { Reblog };
