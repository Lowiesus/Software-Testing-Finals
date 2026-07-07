export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (error?.response?.status === 401) {
    return 'Your session expired. Please log in again.';
  }

  if (error?.response?.data?.message) {
    const message = error.response.data.message;
    return Array.isArray(message) ? message.join(', ') : message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.request) {
    return 'No response from server. Check that the backend is running.';
  }

  return error?.message || fallback;
}

export function clampCount(value) {
  const count = Number(value);
  if (Number.isNaN(count) || count < 0) return 0;
  return count;
}
