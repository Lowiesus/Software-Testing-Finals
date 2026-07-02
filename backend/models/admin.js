import bcrypt from 'bcrypt';
import { supabase } from '../config/database.js';
import { mapAdmin, mapAdmins, toInsertResult, toUpdateResult } from '../utils/supabaseHelpers.js';

export class Admin {
  static async findByEmail(email) {
    const { data, error } = await supabase.from('admins').select('*').eq('email', email).maybeSingle();

    if (error) throw error;
    return mapAdmin(data);
  }

  static async findById(id) {
    const { data, error } = await supabase.from('admins').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    return mapAdmin(data);
  }

  static async getAll() {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, email, full_name, role, is_active, created_at, last_login')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return mapAdmins(data);
  }

  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { data: created, error } = await supabase
      .from('admins')
      .insert({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        full_name: data.full_name || '',
        role: data.role || 'admin',
        is_active: data.is_active ?? true,
        last_login: data.last_login ?? null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return toInsertResult(created);
  }

  static async update(id, updates) {
    const dbUpdates = { ...updates };

    if (updates.profilePicture !== undefined) {
      dbUpdates.profile_picture = updates.profilePicture;
      delete dbUpdates.profilePicture;
    }

    const { data, error } = await supabase.from('admins').update(dbUpdates).eq('id', id).select('*').maybeSingle();

    if (error) throw error;
    return toUpdateResult(data);
  }
}
