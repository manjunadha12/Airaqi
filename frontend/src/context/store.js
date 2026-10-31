import { create } from 'zustand';

const getInitialAuthState = () => {
  const token = localStorage.getItem('accessToken');
  let user = null;
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser && rawUser !== 'undefined') {
      user = JSON.parse(rawUser);
    }
  } catch (e) {
    user = null;
  }
  return {
    user,
    accessToken: token || null,
    isAuthenticated: !!token && !!user,
  };
};

const initialAuth = getInitialAuthState();

export const useAuthStore = create((set) => ({
  user: initialAuth.user,
  isAuthenticated: initialAuth.isAuthenticated,
  accessToken: initialAuth.accessToken,
  loading: false,
  error: null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user, isAuthenticated: !!user });
  },
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
    set({ accessToken: token });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: (user, token, refreshToken, sessionId) => {
    if (token) localStorage.setItem('accessToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (sessionId) localStorage.setItem('sessionId', sessionId);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
      error: null,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export const useAQIStore = create((set) => ({
  currentAQI: null,
  aqiHistory: [],
  aqiForecast: [],
  sensors: [],
  statistics: null,
  selectedCity: 'Delhi',
  selectedLocation: null,
  userGeoLocation: null,
  loading: false,
  error: null,

  setCurrentAQI: (aqi) => set({ currentAQI: aqi }),
  setAQIHistory: (history) => set({ aqiHistory: history }),
  setAQIForecast: (forecast) => set({ aqiForecast: forecast }),
  setSensors: (sensors) => set({ sensors }),
  setStatistics: (stats) => set({ statistics: stats }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  setUserGeoLocation: (geo) => set({ userGeoLocation: geo }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export const useAlertStore = create((set) => ({
  alerts: [],
  alertStatistics: null,
  loading: false,
  error: null,

  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),
  updateAlert: (alertId, updatedData) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert._id === alertId ? { ...alert, ...updatedData } : alert
      ),
    })),
  removeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert._id !== alertId),
    })),
  setAlertStatistics: (stats) => set({ alertStatistics: stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export const usePredictionStore = create((set) => ({
  predictions: [],
  latestPrediction: null,
  loading: false,
  error: null,

  setPredictions: (predictions) => set({ predictions }),
  setLatestPrediction: (prediction) =>
    set({ latestPrediction: prediction }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export const useReportStore = create((set) => ({
  downloadHistory: [],
  statistics: null,
  loading: false,
  error: null,

  setDownloadHistory: (history) => set({ downloadHistory: history }),
  setStatistics: (stats) => set({ statistics: stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));


export const useUIStore = create((set) => ({
  isDarkMode: true,
  sidebarOpen: true,
  toggleDarkMode: () => set((state) => {
    const nextMode = !state.isDarkMode;
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: nextMode };
  }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
