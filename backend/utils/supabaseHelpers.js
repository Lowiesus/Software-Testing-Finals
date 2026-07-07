export const mapDocument = (row) => {
  if (!row) return null;

  const { id, ...rest } = row;
  return { _id: id, ...rest };
};

export const mapDocuments = (rows = []) => rows.map(mapDocument);

export const mapUser = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    role: row.role,
    status: row.status,
    firebaseUid: row.firebase_uid,
    profilePicture: row.profile_picture,
    bio: row.bio || '',
    isGoogleUser: row.is_google_user,
    banned_at: row.banned_at,
    ban_reason: row.ban_reason,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const mapUsers = (rows = []) => rows.map(mapUser);

export const mapAdmin = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    full_name: row.full_name,
    role: row.role,
    is_active: row.is_active,
    created_at: row.created_at,
    last_login: row.last_login,
  };
};

export const mapAdmins = (rows = []) => rows.map(mapAdmin);

export const mapPost = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    caption: row.caption,
    image: row.image,
    category: row.category,
    post_type: row.post_type,
    author_id: row.author_id,
    author_username: row.author_username,
    author_profilePicture: row.author_profile_picture,
    tags: row.tags || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const mapPosts = (rows = []) => rows.map(mapPost);

export const mapComment = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    author_username: row.author_username,
    text: row.text,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const mapComments = (rows = []) => rows.map(mapComment);

export const mapLike = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    created_at: row.created_at,
  };
};

export const mapBookmark = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    created_at: row.created_at,
  };
};

export const mapReblog = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    created_at: row.created_at,
  };
};

export const mapTag = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    name: row.name,
    post_count: row.post_count,
    created_at: row.created_at,
  };
};

export const mapTags = (rows = []) => rows.map(mapTag);

export const toUpdateResult = (data) => ({
  modifiedCount: data ? 1 : 0,
});

export const toDeleteResult = (count = 0) => ({
  deletedCount: count,
});

export const toInsertResult = (row) => ({
  insertedId: row.id,
  ...mapDocument(row),
});
