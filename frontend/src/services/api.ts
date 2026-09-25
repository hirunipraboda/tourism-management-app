// NOVA API Service Foundation Architecture
// Prepares standardized HTTP request handling and mock data fallbacks for backend integration

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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
  const token = localStorage.getItem('nova_auth_token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
      success: true,
    };
  } catch (error) {
    console.warn(`[NOVA API Mock Mode Active] Endpoint "${endpoint}" defaulted to client mock response.`);
    throw error;
  }
}
