import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Handle 401 errors safely without disrupting auth pages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      window.location.pathname.startsWith('/login') ||
      window.location.pathname.startsWith('/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      const hadToken = !!localStorage.getItem('supply_token');
      localStorage.removeItem('supply_token');
      localStorage.removeItem('supply_user');
      if (hadToken) {
        window.location.href = '/login';
      }
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
