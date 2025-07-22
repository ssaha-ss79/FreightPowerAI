// Centralized API utility for backend requests
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';


export async function apiRequest(path: string, options: RequestInit & { skipAuth?: boolean } = {}) {
  const token = localStorage.getItem('token');
  const sendToken = !options.skipAuth && !!token;
  console.log(`[API] ${path} - skipAuth: ${options.skipAuth}, token sent: ${sendToken}`);
  const headers = {
    'Content-Type': 'application/json',
    ...(sendToken ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const { skipAuth, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'API error');
  }
  return res.json();
}
