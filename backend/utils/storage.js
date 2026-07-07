import fs from 'fs';
import path from 'path';
import { getSupabase } from '../config/supabase.js';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

async function ensureBucket() {
  const supabase = getSupabase();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });

    if (error && !error.message?.includes('already exists')) {
      throw error;
    }
  }
}

export async function uploadImageFile(file, folder) {
  const supabase = getSupabase();
  await ensureBucket();

  const ext = path.extname(file.originalname || file.filename || '.jpg');
  const filePath = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const fileBuffer = fs.readFileSync(file.path);

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, fileBuffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteImageByUrl(imageUrl) {
  if (!imageUrl || !imageUrl.includes('/storage/v1/object/public/')) {
    return;
  }

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const filePath = imageUrl.slice(index + marker.length);
  const supabase = getSupabase();
  await supabase.storage.from(BUCKET).remove([filePath]);
}
