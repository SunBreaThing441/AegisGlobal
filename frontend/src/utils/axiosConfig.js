import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Configure global Axios interceptors for AegisGlobal UNESCO Horizon Care Network
 * - Injects standard `Authorization: Bearer <token>`
 * - Intercepts 401 Unauthorized / 403 Forbidden
 * - Handles offline network failures gracefully with telemetry alerts
 */
export const setupAxiosInterceptors = () => {
  // Listen for browser online / offline state transitions
  if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => {
      toast.error('⚠️ Network Disconnected: Horizon Gateway telemetry operating in offline cache mode.', {
        toastId: 'network-offline',
        autoClose: 5000
      });
    });

    window.addEventListener('online', () => {
      toast.success('🌐 Network Connection Restored: Reconnected to Horizon Gateway.', {
        toastId: 'network-online',
        autoClose: 3000
      });
    });
  }

  // Request Interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        // Network failure or gateway connection drop
        if (error.code === 'ERR_NETWORK') {
          toast.error('Horizon Gateway unreachable. Verifying server telemetry...', {
            toastId: 'network-error'
          });
        }
        return Promise.reject(error);
      }

      const { status } = error.response;

      if (status === 401) {
        // Prevent looping on login/register pages
        const isAuthRoute =
          window.location.pathname === '/login' ||
          window.location.pathname === '/register';

        if (!isAuthRoute) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.warn('Session expired. Please re-authenticate with Horizon Gateway.', {
            toastId: 'auth-expired'
          });
          // Redirect after a brief moment
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 1200);
        }
      } else if (status === 403) {
        toast.error('Access Denied: Insufficient UNESCO Horizon directorate clearance.', {
          toastId: 'access-denied'
        });
      }

      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
