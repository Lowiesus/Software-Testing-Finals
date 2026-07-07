import { supabase } from '../config/database.js';
import { mapReblog, assertSupabaseSuccess } from '../utils/supabaseHelpers.js';

const REBLOGS_SETUP = {
  tableName: 'reblogs',
  scriptPath: 'backend/supabase/migrations.sql',
};

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

    assertSupabaseSuccess(error, REBLOGS_SETUP);
    return mapReblog(data);
  }

  static async findByUserId(userId, limit = 20, skip = 0) {
    const { data, error } = await supabase
      .from('reblogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    assertSupabaseSuccess(error, REBLOGS_SETUP);
    return (data || []).map(mapReblog);
  }

  static async countByPostId(postId) {
    const { count, error } = await supabase
      .from('reblogs')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    assertSupabaseSuccess(error, REBLOGS_SETUP);
    return count || 0;
  }

  static async countByUserId(userId) {
    const { count, error } = await supabase
      .from('reblogs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    assertSupabaseSuccess(error, REBLOGS_SETUP);
    return count || 0;
  }

  static async deleteByPostAndUser(postId, userId) {
    const { error, count } = await supabase
      .from('reblogs')
      .delete({ count: 'exact' })
      .eq('post_id', postId)
      .eq('user_id', userId);

    assertSupabaseSuccess(error, REBLOGS_SETUP);
    return (count || 0) > 0;
  }

  static async deleteByPostId(postId) {
    const { error, count } = await supabase.from('reblogs').delete({ count: 'exact' }).eq('post_id', postId);

    assertSupabaseSuccess(error, REBLOGS_SETUP);
    return count || 0;
  }

  static async isRebloggedByUser(postId, userId) {
    const { data, error } = await supabase
      .from('reblogs')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    assertSupabaseSuccess(error, REBLOGS_SETUP);
    return Boolean(data);
  }

  static async countAll() {
    const { count, error } = await supabase
      .from('reblogs')
      .select('*', { count: 'exact', head: true });

    assertSupabaseSuccess(error, REBLOGS_SETUP);
    return count || 0;
  }
}

export { Reblog };
