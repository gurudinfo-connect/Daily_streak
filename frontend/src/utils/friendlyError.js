// Maps any request failure to a safe, human message. Raw backend/DB text is never shown.
export default function friendlyError(err, fallback = 'Something unexpected happened. Please try again.') {
  if (!err?.response) return "We couldn't reach VELoop right now. Please check your connection and try again.";
  const status = err.response.status;
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status >= 500) return 'VELoop is having trouble on our side. Please try again shortly.';
  return fallback;
}
