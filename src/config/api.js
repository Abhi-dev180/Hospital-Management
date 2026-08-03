const getApiUrl = () => {
  // If explicitly defined via VITE_API_URL and it's not the default local string, use it
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:5000') {
    return import.meta.env.VITE_API_URL;
  }
  // Auto-detect environment: use local server on localhost, otherwise fallback to live Render backend URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return 'https://hms-backend-g5e2.onrender.com';
};

const API_URL = getApiUrl();

export default API_URL;
