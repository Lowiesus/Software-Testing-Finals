export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const RECOMMENDED_TAGS = [
  'Life',
  'Science',
  'Technology',
  'Health',
  'Education',
  'Art',
  'Music',
  'Sports',
  'Travel',
  'Food',
  'Business',
  'Entertainment',
  'Fashion',
  'Gaming',
  'News',
];

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
};
