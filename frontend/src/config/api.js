const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.origin.includes('localhost:3000')
    ? 'http://localhost:5000/api'
    : (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000/api'));

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (typeof window !== 'undefined' && window.location.origin.includes('localhost:3000')
    ? 'http://localhost:5000'
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'));

export const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID &&
  !process.env.REACT_APP_GOOGLE_CLIENT_ID.includes('your_google_client_id')
    ? process.env.REACT_APP_GOOGLE_CLIENT_ID
    : '504324038442-8jp02senqb62ddjo7eardoldebkp92bv.apps.googleusercontent.com';

export const config = {
  API_URL,
  SOCKET_URL,
  TIMEOUT: 30000,
  GOOGLE_CLIENT_ID,
};

export const endpoints = {
  // Auth
  AUTH_REGISTER: `${API_URL}/auth/register`,
  AUTH_LOGIN: `${API_URL}/auth/login`,
  AUTH_GOOGLE: `${API_URL}/auth/google`,
  AUTH_ME: `${API_URL}/auth/me`,
  AUTH_VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
  AUTH_RESEND_VERIFICATION: `${API_URL}/auth/resend-verification`,
  AUTH_SEND_OTP: `${API_URL}/auth/send-otp`,
  AUTH_VERIFY_OTP: `${API_URL}/auth/verify-otp`,
  AUTH_FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
  AUTH_RESET_PASSWORD: `${API_URL}/auth/reset-password`,
  AUTH_REFRESH_TOKEN: `${API_URL}/auth/refresh-token`,
  AUTH_LOGOUT: `${API_URL}/auth/logout`,
  AUTH_ORGANIZATIONS: `${API_URL}/auth/organizations`,
  AUTH_UPDATE_PROFILE: `${API_URL}/auth/profile`,
  AUTH_CHANGE_PASSWORD: `${API_URL}/auth/change-password`,

  // AQI
  AQI_CURRENT: `${API_URL}/aqi/current`,
  AQI_GEO: `${API_URL}/aqi/geo`,
  AQI_BOUNDS: `${API_URL}/aqi/bounds`,
  AQI_STATION: `${API_URL}/aqi/station`,
  AQI_REVERSE_GEOCODE: `${API_URL}/aqi/reverse-geocode`,
  AQI_SEARCH_LOCATION: `${API_URL}/aqi/search-location`,
  AQI_HISTORY: `${API_URL}/aqi/history`,
  AQI_STATISTICS: `${API_URL}/aqi/statistics`,
  AQI_SENSORS: `${API_URL}/aqi/sensors`,
  AQI_SUBMIT: `${API_URL}/aqi/submit`,
  AQI_SENSOR_HISTORY: `${API_URL}/aqi/sensor-history`,
  AQI_FORECAST: `${API_URL}/aqi/forecast`,
  AQI_COMPARISON: `${API_URL}/aqi/comparison`,

  // Alerts
  ALERTS_CREATE: `${API_URL}/alerts`,
  ALERTS_GET: `${API_URL}/alerts`,
  ALERTS_STATISTICS: `${API_URL}/alerts/statistics`,
  ALERTS_HISTORY: `${API_URL}/alerts/history`,

  // Predictions
  PREDICTIONS_GENERATE: `${API_URL}/predictions/generate`,
  PREDICTIONS_LATEST: `${API_URL}/predictions/latest`,
  PREDICTIONS_ORGANIZATION: `${API_URL}/predictions/organization`,
  PREDICTIONS_TRENDS: `${API_URL}/predictions/trends`,
  PREDICTIONS_CALCULATE: `${API_URL}/predictions/calculate`,

  // Reports
  REPORTS_GENERATE: `${API_URL}/reports/generate`,
  REPORTS_HISTORY: `${API_URL}/reports/history`,
  REPORTS_STATISTICS: `${API_URL}/reports/statistics`,
  REPORTS_EXPORT: `${API_URL}/reports/export/logs`,
};

// Indian National AQI Categories & Colors
export const AQI_CATEGORIES = {
  GOOD: {
    min: 0,
    max: 50,
    label: 'Good',
    key: 'good',
    color: '#16a34a', // Green
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    badgeClass: 'text-green-300 bg-green-950/70 border-green-500/50'
  },
  SATISFACTORY: {
    min: 51,
    max: 100,
    label: 'Satisfactory',
    key: 'satisfactory',
    color: '#84cc16', // Light Green
    bgColor: 'bg-lime-500',
    textColor: 'text-lime-400',
    badgeClass: 'text-lime-300 bg-lime-950/70 border-lime-500/50'
  },
  MODERATE: {
    min: 101,
    max: 200,
    label: 'Moderate',
    key: 'moderate',
    color: '#eab308', // Yellow
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    badgeClass: 'text-yellow-300 bg-yellow-950/70 border-yellow-500/50'
  },
  POOR: {
    min: 201,
    max: 300,
    label: 'Poor',
    key: 'poor',
    color: '#f97316', // Orange
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-400',
    badgeClass: 'text-orange-300 bg-orange-950/70 border-orange-500/50'
  },
  VERY_POOR: {
    min: 301,
    max: 400,
    label: 'Very Poor',
    key: 'very_poor',
    color: '#ef4444', // Red
    bgColor: 'bg-red-500',
    textColor: 'text-red-400',
    badgeClass: 'text-red-300 bg-red-950/70 border-red-500/50'
  },
  SEVERE: {
    min: 401,
    max: 500,
    label: 'Severe',
    key: 'severe',
    color: '#7f1d1d', // Dark Red
    bgColor: 'bg-rose-900',
    textColor: 'text-rose-400',
    badgeClass: 'text-rose-200 bg-rose-950/80 border-rose-600/60'
  },
};

// Alert Types
export const ALERT_TYPES = [
  'aqi_warning',
  'aqi_critical',
  'smoke_detected',
  'gas_leakage',
  'temperature_threshold',
  'sensor_failure',
];

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  ANALYST: 'analyst',
  USER: 'user',
};
