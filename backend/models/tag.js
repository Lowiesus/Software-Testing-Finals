import { supabase } from '../config/database.js';
import { mapTag, mapTags } from '../utils/supabaseHelpers.js';

class Tag {
  static async createTag(name) {
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: name.toLowerCase(),
        post_count: 0,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapTag(data);
  }

  static async findById(id) {
    const { data, error } = await supabase.from('tags').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    return mapTag(data);
  }

  static async findByName(name) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('name', name.toLowerCase())
      .maybeSingle();

    if (error) throw error;
    return mapTag(data);
  }

  static async getAllTags(limit = 50, skip = 0) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('post_count', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;
    return mapTags(data);
  }

  static async searchTags(query, limit = 20) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query.toLowerCase()}%`)
      .order('post_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return mapTags(data);
  }

  static async incrementPostCount(tagName) {
    const existing = await this.findByName(tagName);

    if (!existing) {
      return this.createTag(tagName);
    }

    const { data, error } = await supabase
      .from('tags')
      .update({ post_count: existing.post_count + 1 })
      .eq('id', existing._id)
      .select('*')
      .single();

    if (error) throw error;
    return mapTag(data);
  }

  static async decrementPostCount(tagName) {
    const existing = await this.findByName(tagName);
    if (!existing || existing.post_count <= 0) return false;

    const { error } = await supabase
      .from('tags')
      .update({ post_count: Math.max(existing.post_count - 1, 0) })
      .eq('id', existing._id);

    if (error) throw error;
    return true;
  }

  static async deleteTag(id) {
    const { error, count } = await supabase.from('tags').delete({ count: 'exact' }).eq('id', id);

    if (error) throw error;
    return (count || 0) > 0;
  }

  static async deleteByName(name) {
    const { error, count } = await supabase
      .from('tags')
      .delete({ count: 'exact' })
      .eq('name', name.toLowerCase());

    if (error) throw error;
    return (count || 0) > 0;
  }
}

export { Tag };
