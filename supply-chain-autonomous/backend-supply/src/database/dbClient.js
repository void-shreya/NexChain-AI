const { createClient } = require('@supabase/supabase-js');
const seedData = require('./seedData');

// Check for Supabase environment credentials
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isUsingSupabase = false;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes('your-supabase-url')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    isUsingSupabase = true;
    console.log('✅ Supabase Client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Supabase initialization failed, falling back to local memory store:', err.message);
  }
} else {
  console.log('ℹ️ Running in Autonomous Memory Store mode (ready for Supabase configuration).');
}

// In-Memory store holding current application state
class MemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    // Deep clone seed data to preserve mutations independently
    this.users = JSON.parse(JSON.stringify(seedData.users));
    this.warehouses = JSON.parse(JSON.stringify(seedData.warehouses));
    this.suppliers = JSON.parse(JSON.stringify(seedData.suppliers));
    this.products = JSON.parse(JSON.stringify(seedData.products));
    this.alternativeSuppliers = JSON.parse(JSON.stringify(seedData.alternativeSuppliers));
    this.customers = JSON.parse(JSON.stringify(seedData.customers));
    this.inventory = JSON.parse(JSON.stringify(seedData.inventory));
    this.orders = JSON.parse(JSON.stringify(seedData.orders));
    this.shipments = JSON.parse(JSON.stringify(seedData.shipments));
    this.disruptions = JSON.parse(JSON.stringify(seedData.disruptions));
    this.aiDecisions = JSON.parse(JSON.stringify(seedData.aiDecisions));
    this.simulations = [];
    this.auditLogs = JSON.parse(JSON.stringify(seedData.auditLogs));
    this.notifications = JSON.parse(JSON.stringify(seedData.notifications));
  }
}

const memory = new MemoryStore();

// Unified Repository API
const db = {
  isSupabaseConnected: () => isUsingSupabase,

  // Users
  findUserByEmail: async (email) => {
    return memory.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: async (id) => {
    return memory.users.find((u) => u.id === id);
  },
  createUser: async (userData) => {
    const newUser = {
      id: `u-${Date.now()}`,
      created_at: new Date().toISOString(),
      is_active: true,
      ...userData,
    };
    memory.users.push(newUser);
    return newUser;
  },

  // Suppliers
  getSuppliers: async () => memory.suppliers,
  getSupplierById: async (id) => memory.suppliers.find((s) => s.id === id || s.code === id),
  updateSupplier: async (id, updates) => {
    const idx = memory.suppliers.findIndex((s) => s.id === id || s.code === id);
    if (idx !== -1) {
      memory.suppliers[idx] = { ...memory.suppliers[idx], ...updates, updated_at: new Date().toISOString() };
      return memory.suppliers[idx];
    }
    return null;
  },

  // Warehouses
  getWarehouses: async () => memory.warehouses,
  getWarehouseById: async (id) => memory.warehouses.find((w) => w.id === id || w.code === id),

  // Products
  getProducts: async () => memory.products,
  getProductById: async (id) => memory.products.find((p) => p.id === id || p.sku === id),
  getAlternativeSuppliers: async (productId) => {
    if (!productId) return memory.alternativeSuppliers;
    return memory.alternativeSuppliers.filter((a) => a.product_id === productId);
  },

  // Inventory
  getInventory: async (filters = {}) => {
    let result = [...memory.inventory];
    if (filters.status) result = result.filter((i) => i.status === filters.status);
    if (filters.warehouseId) result = result.filter((i) => i.warehouse_id === filters.warehouseId);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((i) => i.product_name.toLowerCase().includes(q) || i.product_sku.toLowerCase().includes(q));
    }
    return result;
  },
  updateInventoryStock: async (id, stockUpdates) => {
    const item = memory.inventory.find((i) => i.id === id);
    if (item) {
      Object.assign(item, stockUpdates);
      item.available_stock = item.current_stock - item.reserved_stock;
      return item;
    }
    return null;
  },

  // Customers & Orders
  getCustomers: async () => memory.customers,
  getOrders: async (filters = {}) => {
    let result = [...memory.orders];
    if (filters.status) result = result.filter((o) => o.status === filters.status);
    if (filters.risk_status) result = result.filter((o) => o.risk_status === filters.risk_status);
    if (filters.priority) result = result.filter((o) => o.priority === filters.priority);
    return result;
  },
  getOrderById: async (id) => memory.orders.find((o) => o.id === id || o.order_number === id),
  updateOrder: async (id, updates) => {
    const idx = memory.orders.findIndex((o) => o.id === id || o.order_number === id);
    if (idx !== -1) {
      memory.orders[idx] = { ...memory.orders[idx], ...updates, updated_at: new Date().toISOString() };
      return memory.orders[idx];
    }
    return null;
  },

  // Shipments
  getShipments: async (filters = {}) => {
    let result = [...memory.shipments];
    if (filters.status) result = result.filter((s) => s.status === filters.status);
    return result;
  },
  getShipmentById: async (id) => memory.shipments.find((s) => s.id === id || s.tracking_number === id),
  updateShipment: async (id, updates) => {
    const idx = memory.shipments.findIndex((s) => s.id === id || s.tracking_number === id);
    if (idx !== -1) {
      memory.shipments[idx] = { ...memory.shipments[idx], ...updates, updated_at: new Date().toISOString() };
      return memory.shipments[idx];
    }
    return null;
  },

  // Disruptions
  getDisruptions: async () => memory.disruptions,
  getDisruptionById: async (id) => memory.disruptions.find((d) => d.id === id || d.code === id),
  createDisruption: async (data) => {
    const newDisruption = {
      id: `disrupt-${Date.now()}`,
      code: `DISRUPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ACTIVE',
      detected_at: new Date().toISOString(),
      ...data,
    };
    memory.disruptions.unshift(newDisruption);
    return newDisruption;
  },
  updateDisruption: async (id, updates) => {
    const idx = memory.disruptions.findIndex((d) => d.id === id || d.code === id);
    if (idx !== -1) {
      memory.disruptions[idx] = { ...memory.disruptions[idx], ...updates, updated_at: new Date().toISOString() };
      return memory.disruptions[idx];
    }
    return null;
  },

  // Decisions
  getDecisions: async () => memory.aiDecisions,
  getDecisionById: async (id) => memory.aiDecisions.find((d) => d.id === id),
  createDecision: async (data) => {
    const newDecision = {
      id: `dec-${Date.now()}`,
      created_at: new Date().toISOString(),
      approval_status: data.requires_human_approval ? 'PENDING' : 'AUTO_EXECUTED',
      execution_status: data.requires_human_approval ? 'PENDING' : 'COMPLETED',
      ...data,
    };
    memory.aiDecisions.unshift(newDecision);
    return newDecision;
  },
  updateDecision: async (id, updates) => {
    const idx = memory.aiDecisions.findIndex((d) => d.id === id);
    if (idx !== -1) {
      memory.aiDecisions[idx] = { ...memory.aiDecisions[idx], ...updates, updated_at: new Date().toISOString() };
      return memory.aiDecisions[idx];
    }
    return null;
  },

  // Simulations
  getSimulations: async () => memory.simulations,
  createSimulation: async (data) => {
    const sim = {
      id: `sim-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...data,
    };
    memory.simulations.unshift(sim);
    return sim;
  },

  // Audit Logs
  getAuditLogs: async (limit = 100) => {
    return memory.auditLogs.slice(0, limit).map((l) => ({
      ...l,
      user_name: l.user_name || 'SupplyChain Guardian AI',
    }));
  },
  createAuditLog: async (log) => {
    const newLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user_name: log.user_name || 'SupplyChain Guardian AI',
      result_status: 'SUCCESS',
      ...log,
    };
    memory.auditLogs.unshift(newLog);
    return newLog;
  },

  // Notifications
  getNotifications: async () => memory.notifications,
  createNotification: async (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
      ...notif,
    };
    memory.notifications.unshift(newNotif);
    return newNotif;
  },
  markNotificationRead: async (id) => {
    const item = memory.notifications.find((n) => n.id === id);
    if (item) {
      item.is_read = true;
      return item;
    }
    return null;
  },
  markAllNotificationsRead: async () => {
    memory.notifications.forEach((n) => { n.is_read = true; });
    return true;
  },

  // Reset demo state back to pristine seed
  resetDemoData: () => {
    memory.reset();
    return true;
  },
};

module.exports = {
  db,
  supabase,
};
