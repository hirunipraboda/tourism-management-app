// NOVA API Service Foundation Architecture
// Prepares standardized HTTP request handling and mock data fallbacks for backend integration

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('nova_auth_token') || localStorage.getItem('travellink_admin_session');
  let authToken = token;

  try {
    if (token && token.startsWith('{')) {
      const parsed = JSON.parse(token);
      if (parsed.token) authToken = parsed.token;
    }
  } catch (e) {
    // raw token string
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const resJson = await response.json();
    const payloadData = resJson.data !== undefined ? resJson.data : resJson;

    return {
      data: payloadData,
      status: response.status,
      message: resJson.message,
      success: resJson.success !== undefined ? resJson.success : true,
    };
  } catch (error) {
    console.warn(`[Travel Link API] Endpoint "${endpoint}" fetch error or backend unavailable. Falling back to mock logic if configured.`, error);
    throw error;
  }
}
