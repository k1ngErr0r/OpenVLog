import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  withCredentials: true,
});

// Attach auth token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: { resolve: (token?: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token?: string) => {
  pendingQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
};

api.interceptors.response.use(
  resp => {
    // Cache user object if auth endpoints return it
    if (resp.config?.url?.includes('/api/auth/') && resp.data?.user) {
      try { localStorage.setItem('user', JSON.stringify(resp.data.user)); } catch {/* ignore */}
    }
    return resp;
  },
  async error => {
    const originalConfig = error.config;
    const status = error.response?.status;

    // If forbidden (403) just bubble up (permission issue)
    if (status === 403) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve: (token) => {
              if (token) originalConfig.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalConfig));
            }, reject });
          });
        }
        isRefreshing = true;
        const refreshResp = await api.post('/api/auth/refresh');
        const newToken = refreshResp.data.token;
        localStorage.setItem('token', newToken);
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalConfig);
      } catch (refreshErr) {
        localStorage.removeItem('token');
        processQueue(refreshErr, undefined);
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Basic logging
    console.error('API error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

let toastInterceptorAttached = false;
// Provide a helper hook to bind toast to axios without circular issues
export function useApiWithToasts() {
  const toast = useToast().push;
  if (!toastInterceptorAttached) {
    api.interceptors.response.use(
      r => r,
      err => {
        const status = err.response?.status;
        if (status === 401) {
          toast.warning('Refreshing session…');
        } else if (status === 403) {
          toast.error('Forbidden: insufficient permissions.');
        } else if (status && status >= 500) {
          toast.error('Server error. Please try again later.');
        }
        return Promise.reject(err);
      }
    );
    toastInterceptorAttached = true;
  }
  return api;
}

export default api;
