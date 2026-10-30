import axios from 'axios';
import { config, endpoints } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: config.API_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((req) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    if (req.headers && typeof req.headers.set === 'function') {
      req.headers.set('Authorization', `Bearer ${token}`);
    } else {
      req.headers = req.headers || {};
      req.headers.Authorization = `Bearer ${token}`;
    }
  }
  return req;
});

// Handle response
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If token expired on protected requests, try to refresh
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/google') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(endpoints.AUTH_REFRESH_TOKEN, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        } else if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth
  register: (data) => apiClient.post(endpoints.AUTH_REGISTER, data),
  login: (identifier, password) =>
    apiClient.post(endpoints.AUTH_LOGIN, { identifier, password }),
  googleAuth: (credential, mode = 'login', allowCreate = false) =>
    apiClient.post(endpoints.AUTH_GOOGLE, { credential, mode, allowCreate }),
  getMe: () => apiClient.get(endpoints.AUTH_ME),
  verifyEmail: (data) =>
    apiClient.post(
      endpoints.AUTH_VERIFY_EMAIL,
      typeof data === 'string' ? { token: data } : data
    ),
  resendVerification: (email) =>
    apiClient.post(endpoints.AUTH_RESEND_VERIFICATION, { email }),
  sendOTP: (email) => apiClient.post(endpoints.AUTH_SEND_OTP, { email }),
  verifyOTP: (email, otp) =>
    apiClient.post(endpoints.AUTH_VERIFY_OTP, { email, otp }),
  forgotPassword: (email) =>
    apiClient.post(endpoints.AUTH_FORGOT_PASSWORD, { email }),
  resetPassword: (data) =>
    apiClient.post(endpoints.AUTH_RESET_PASSWORD, data),
  logout: () => apiClient.post(endpoints.AUTH_LOGOUT),
  getOrganizations: () => apiClient.get(endpoints.AUTH_ORGANIZATIONS),
  updateProfile: (data) => apiClient.put(endpoints.AUTH_UPDATE_PROFILE, data),
  changePassword: (data) => apiClient.post(endpoints.AUTH_CHANGE_PASSWORD, data),

  // AQI
  getCurrentAQI: (params) =>
    apiClient.get(endpoints.AQI_CURRENT, { params }),
  getAQIByCoordinates: (params) =>
    apiClient.get(endpoints.AQI_GEO, { params }),
  getAQIByBounds: (params) =>
    apiClient.get(endpoints.AQI_BOUNDS, { params }),
  getAQIStationDetails: (uid) =>
    apiClient.get(`${endpoints.AQI_STATION}/${uid}`),
  reverseGeocode: (params) =>
    apiClient.get(endpoints.AQI_REVERSE_GEOCODE, { params }),
  searchLocation: (params) =>
    apiClient.get(endpoints.AQI_SEARCH_LOCATION, { params }),
  getAQIHistory: (params) =>
    apiClient.get(endpoints.AQI_HISTORY, { params }),
  getAQIStatistics: (params) =>
    apiClient.get(endpoints.AQI_STATISTICS, { params }),
  getAllSensorsAQI: (params) =>
    apiClient.get(endpoints.AQI_SENSORS, { params }),
  getAQIForecast: (params) =>
    apiClient.get(endpoints.AQI_FORECAST, { params }),
  getAQIComparison: () =>
    apiClient.get(endpoints.AQI_COMPARISON),
  submitAQIReading: (data) => apiClient.post(endpoints.AQI_SUBMIT, data),

  // Alerts
  createAlert: (data) => apiClient.post(endpoints.ALERTS_CREATE, data),
  getAlerts: (params) => apiClient.get(endpoints.ALERTS_GET, { params }),
  getAlertById: (alertId) =>
    apiClient.get(`${endpoints.ALERTS_GET}/${alertId}`),
  acknowledgeAlert: (alertId) =>
    apiClient.put(`${endpoints.ALERTS_GET}/${alertId}/acknowledge`),
  resolveAlert: (alertId, data) =>
    apiClient.put(`${endpoints.ALERTS_GET}/${alertId}/resolve`, data),
  getAlertStatistics: (params) =>
    apiClient.get(endpoints.ALERTS_STATISTICS, { params }),

  // Predictions
  generatePrediction: (data) =>
    apiClient.post(endpoints.PREDICTIONS_GENERATE, data),
  calculatePrediction: (data) =>
    apiClient.post(endpoints.PREDICTIONS_CALCULATE, data),
  getLatestPrediction: (sensorId) =>
    apiClient.get(`${endpoints.PREDICTIONS_LATEST}/${sensorId}`),
  getOrganizationPredictions: (params) =>
    apiClient.get(endpoints.PREDICTIONS_ORGANIZATION, { params }),
  getPollutionTrends: (params) =>
    apiClient.get(endpoints.PREDICTIONS_TRENDS, { params }),

  // Reports
  generateReport: (data) =>
    apiClient.post(endpoints.REPORTS_GENERATE, data),
  getDownloadHistory: (params) =>
    apiClient.get(endpoints.REPORTS_HISTORY, { params }),
  getDownloadStatistics: (params) =>
    apiClient.get(endpoints.REPORTS_STATISTICS, { params }),
  exportDownloadLogs: (params) =>
    apiClient.get(endpoints.REPORTS_EXPORT, { params }),
};

export default apiClient;
