import { supabase } from '../config/database.js';
import { mapComment, mapComments, toDeleteResult, toUpdateResult } from '../utils/supabaseHelpers.js';

export class Comment {
  static async createComment(dataOrPostId, userId, text) {
    let data;

    if (typeof dataOrPostId === 'object') {
      data = dataOrPostId;
    } else {
      data = {
        post_id: dataOrPostId,
        author_id: userId,
        text,
      };
    }

    const comment = {
      post_id: data.post_id,
      author_id: data.author_id,
      author_username: data.author_username || 'user',
      text: data.text,
    };

    const { data: created, error } = await supabase.from('comments').insert(comment).select('*').single();

    if (error) throw error;
    return mapComment(created);
  }

  static async findById(id) {
    const { data, error } = await supabase.from('comments').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    return mapComment(data);
  }

  static async findByPostId(postId, limit = 20, skip = 0) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return mapComments(data);
  }

  static async findByAuthorId(authorId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return mapComments(data);
  }

  static async countByPostId(postId) {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  }

  static async updateComment(id, text) {
    const { data, error } = await supabase
      .from('comments')
      .update({
        text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  static async deleteComment(id) {
    const { error, count } = await supabase.from('comments').delete({ count: 'exact' }).eq('id', id);

    if (error) throw error;
    return (count || 0) > 0;
  }

  static async deleteByPostId(postId) {
    const { error, count } = await supabase.from('comments').delete({ count: 'exact' }).eq('post_id', postId);

    if (error) throw error;
    return toDeleteResult(count);
  }
}
