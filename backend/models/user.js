import bcrypt from 'bcrypt';
import { supabase } from '../config/database.js';
import { mapUser, mapUsers, toDeleteResult, toInsertResult, toUpdateResult } from '../utils/supabaseHelpers.js';

export const USER_STATUS = {
  NOT_VERIFIED: 'not_verified',
  VERIFIED: 'verified',
  BANNED: 'banned',
};

export class User {
  static async findByUsernameOrEmail(identifier) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq."${identifier}",email.eq."${identifier}"`)
      .maybeSingle();

    if (error) throw error;
    return mapUser(data);
  }

  static async findByEmail(email) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();

    if (error) throw error;
    return mapUser(data);
  }

  static async findByFirebaseUid(firebaseUid) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    if (error) throw error;
    return mapUser(data);
  }

  static async findById(id) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    return mapUser(data);
  }

  static async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, status, firebase_uid, profile_picture, bio, is_google_user, banned_at, ban_reason, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return mapUsers(data);
  }

  static async searchByUsername(searchTerm, limit = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, profile_picture, status, bio')
      .ilike('username', `%${searchTerm}%`)
      .neq('status', USER_STATUS.BANNED)
      .limit(limit);

    if (error) throw error;
    return mapUsers(data);
  }

  static async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { data: created, error } = await supabase
      .from('users')
      .insert({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: 'user',
        status: USER_STATUS.NOT_VERIFIED,
      })
      .select('*')
      .single();

    if (error) throw error;
    return toInsertResult(created);
  }

  static async createGoogleUser(data) {
    const { data: created, error } = await supabase
      .from('users')
      .insert({
        username: data.username,
        email: data.email,
        firebase_uid: data.firebaseUid,
        profile_picture: data.profilePicture,
        role: 'user',
        status: data.status || USER_STATUS.NOT_VERIFIED,
        is_google_user: true,
      })
      .select('*')
      .single();

    if (error) throw error;
    return toInsertResult(created);
  }

  static async update(id, updates) {
    const dbUpdates = {
      updated_at: new Date().toISOString(),
    };

    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.firebaseUid !== undefined) dbUpdates.firebase_uid = updates.firebaseUid;
    if (updates.profilePicture !== undefined) dbUpdates.profile_picture = updates.profilePicture;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.isGoogleUser !== undefined) dbUpdates.is_google_user = updates.isGoogleUser;
    if (updates.banned_at !== undefined) dbUpdates.banned_at = updates.banned_at;
    if (updates.ban_reason !== undefined) dbUpdates.ban_reason = updates.ban_reason;

    const { data, error } = await supabase.from('users').update(dbUpdates).eq('id', id).select('*').maybeSingle();

    if (error) {
      if (
        error.message?.includes('bio') &&
        (error.message?.includes('column') || error.code === 'PGRST204')
      ) {
        throw new Error(
          "Bio column is missing on users table. Run backend/supabase/migrations.sql in Supabase.",
        );
      }
      throw error;
    }

    return toUpdateResult(data);
  }

  static async updateStatus(id, status) {
    if (!Object.values(USER_STATUS).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    return this.update(id, { status });
  }

  static async isBanned(id) {
    const user = await this.findById(id);
    return user?.status === USER_STATUS.BANNED;
  }

  static async isVerified(id) {
    const user = await this.findById(id);
    return user?.status === USER_STATUS.VERIFIED;
  }

  static async delete(id) {
    const { error, count } = await supabase.from('users').delete({ count: 'exact' }).eq('id', id);

    if (error) throw error;
    return toDeleteResult(count);
  }
}
