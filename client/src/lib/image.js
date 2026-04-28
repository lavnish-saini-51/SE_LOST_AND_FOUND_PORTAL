export function resolveImageUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  // If backend is deployed on another origin, set VITE_BACKEND_URL (e.g. http://localhost:5000)
  const backend = import.meta.env.VITE_BACKEND_URL || "";

  if (url.startsWith("/uploads/")) {
    return backend ? `${backend}${url}` : url;
  }

  return url;
}

