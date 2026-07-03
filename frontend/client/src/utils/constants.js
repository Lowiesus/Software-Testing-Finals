export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
};
