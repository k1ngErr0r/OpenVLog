import axios from 'axios';
import { useToast } from '@/components/ui/toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
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

// Handle 401 globally
api.interceptors.response.use(
  resp => resp,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Basic logging (could integrate with external service)
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
  const { push } = useToast();
  if (!toastInterceptorAttached) {
    api.interceptors.response.use(
      r => r,
      err => {
        const status = err.response?.status;
        if (status === 401) {
          push({ type: 'warning', message: 'Session expired. Please log in again.' });
        } else if (status === 403) {
          push({ type: 'error', message: 'You do not have permission to perform that action.' });
        } else if (status && status >= 500) {
          push({ type: 'error', message: 'Server error. Please try again later.' });
        }
        return Promise.reject(err);
      }
    );
    toastInterceptorAttached = true;
  }
  return api;
}

export default api;
