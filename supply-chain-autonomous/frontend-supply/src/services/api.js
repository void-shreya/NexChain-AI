import axios from 'axios';

// Dynamically determine the backend URL based on runtime browser location
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

    // If deployed on Vercel or any non-localhost host, NEVER use localhost:5000!
    if (!isLocalhost) {
      const configured = import.meta.env.VITE_API_URL;
      if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
        return configured;
      }
      return 'https://nexchain-ai.onrender.com/api';
    }
  }

  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔗 API Base URL resolved to:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 seconds to gracefully accommodate Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supply_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors safely with user-friendly network diagnostics
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register'));

    // Handle 401 unauthorized
    if (error.response?.status === 401 && !isAuthRoute) {
      const hadToken = !!localStorage.getItem('supply_token');
      localStorage.removeItem('supply_token');
      localStorage.removeItem('supply_user');
      if (hadToken) {
        window.location.href = '/login';
      }
    }

    // Enhance Network Error messages (e.g. during cold starts or network drops)
    if (!error.response && error.message === 'Network Error') {
      error.message = 'Unable to reach backend service. The server may be waking up from cold sleep (please wait 10-15s and retry) or check internet connection.';
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const dashboardApi = {
  getMetrics: () => api.get('/dashboard'),
};

export const suppliersApi = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  updateStatus: (id, data) => api.patch(`/suppliers/${id}/status`, data),
};

export const inventoryApi = {
  getAll: (params) => api.get('/inventory', { params }),
  adjustStock: (id, data) => api.post(`/inventory/${id}/adjust`, data),
};

export const ordersApi = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  reprioritize: (data) => api.post('/orders/reprioritize', data),
};

export const shipmentsApi = {
  getAll: (params) => api.get('/shipments', { params }),
  getById: (id) => api.get(`/shipments/${id}`),
  updateTelemetry: (id, data) => api.patch(`/shipments/${id}/telemetry`, data),
};

export const disruptionsApi = {
  getAll: () => api.get('/disruptions'),
  getById: (id) => api.get(`/disruptions/${id}`),
  create: (data) => api.post('/disruptions', data),
  triggerDemo: () => api.post('/disruptions/demo/trigger'),
  resolve: (id) => api.patch(`/disruptions/${id}/resolve`),
};

export const simulationApi = {
  run: (params) => api.post('/simulation/run', params),
  getHistory: () => api.get('/simulation/history'),
};

export const agentApi = {
  analyze: (disruptionId) => api.post('/agent/analyze', { disruptionId }),
  sendCommand: (query) => api.post('/agent/command', { query }),
  approveAction: (decisionId, comments) => api.post('/agent/approve', { decisionId, comments }),
  rejectAction: (decisionId, reason) => api.post('/agent/reject', { decisionId, reason }),
  setMode: (mode, autoApprovalThresholdInr) => api.post('/agent/mode', { mode, autoApprovalThresholdInr }),
};

export const decisionsApi = {
  getAll: () => api.get('/decisions'),
  getById: (id) => api.get(`/decisions/${id}`),
};

export const auditApi = {
  getLogs: (params) => api.get('/audit-logs', { params }),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const demoApi = {
  reset: () => api.post('/demo/reset'),
};

export default api;
