const { createClient } = require('@supabase/supabase-js');
const seedData = require('./seedData');

// Check for Supabase environment credentials
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isUsingSupabase = false;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes('your-supabase-url')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    isUsingSupabase = true;
    console.log('✅ Supabase Client initialized successfully with URL:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Supabase initialization failed, falling back to local memory store:', err.message);
  }
} else {
  console.log('ℹ️ Running in Autonomous Memory Store mode (ready for Supabase configuration).');
}

// In-Memory store holding fallback / cached application state
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

// Unified Repository API with live Supabase query engine and resilient memory fallback
const db = {
  isSupabaseConnected: () => isUsingSupabase,

  // Table Statistics & Status
  getTableStats: async () => {
    if (!isUsingSupabase) {
      return {
        connected: false,
        source: 'memory',
        tables: {
          users: memory.users.length,
          warehouses: memory.warehouses.length,
          suppliers: memory.suppliers.length,
          products: memory.products.length,
          customers: memory.customers.length,
          inventory: memory.inventory.length,
          orders: memory.orders.length,
          shipments: memory.shipments.length,
          disruptions: memory.disruptions.length,
          ai_decisions: memory.aiDecisions.length,
        },
      };
    }
    try {
      const tableNames = ['users', 'warehouses', 'suppliers', 'products', 'alternative_suppliers', 'customers', 'inventory', 'orders', 'order_items', 'shipments', 'disruptions', 'ai_decisions', 'audit_logs', 'notifications'];
      const stats = {};
      for (const t of tableNames) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        stats[t] = error ? 0 : count;
      }
      return { connected: true, source: 'supabase_postgres', url: SUPABASE_URL, tables: stats };
    } catch {
      return { connected: false, source: 'fallback_memory' };
    }
  },

  // Users
  findUserByEmail: async (email) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', email.trim())
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase findUserByEmail fallback:', e.message);
      }
    }
    return memory.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById: async (id) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase findUserById fallback:', e.message);
      }
    }
    return memory.users.find((u) => u.id === id);
  },

  createUser: async (userData) => {
    const newUser = {
      id: userData.id || `u-${Date.now()}`,
      created_at: new Date().toISOString(),
      is_active: true,
      ...userData,
    };
    memory.users.push(newUser);
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('users').insert(newUser).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase createUser error:', e.message);
      }
    }
    return newUser;
  },

  // Suppliers
  getSuppliers: async () => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getSuppliers fallback:', e.message);
      }
    }
    return memory.suppliers;
  },

  getSupplierById: async (id) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .or(`id.eq.${id},code.eq.${id}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getSupplierById fallback:', e.message);
      }
    }
    return memory.suppliers.find((s) => s.id === id || s.code === id);
  },

  updateSupplier: async (id, updates) => {
    const idx = memory.suppliers.findIndex((s) => s.id === id || s.code === id);
    if (idx !== -1) {
      memory.suppliers[idx] = { ...memory.suppliers[idx], ...updates, updated_at: new Date().toISOString() };
    }
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .or(`id.eq.${id},code.eq.${id}`)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateSupplier fallback:', e.message);
      }
    }
    return idx !== -1 ? memory.suppliers[idx] : null;
  },

  // Warehouses
  getWarehouses: async () => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('warehouses').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getWarehouses fallback:', e.message);
      }
    }
    return memory.warehouses;
  },

  getWarehouseById: async (id) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('warehouses')
          .select('*')
          .or(`id.eq.${id},code.eq.${id}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getWarehouseById fallback:', e.message);
      }
    }
    return memory.warehouses.find((w) => w.id === id || w.code === id);
  },

  // Products
  getProducts: async () => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getProducts fallback:', e.message);
      }
    }
    return memory.products;
  },

  getProductById: async (id) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`id.eq.${id},sku.eq.${id}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getProductById fallback:', e.message);
      }
    }
    return memory.products.find((p) => p.id === id || p.sku === id);
  },

  getAlternativeSuppliers: async (productId) => {
    if (isUsingSupabase) {
      try {
        let q = supabase.from('alternative_suppliers').select('*');
        if (productId) q = q.eq('product_id', productId);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getAlternativeSuppliers fallback:', e.message);
      }
    }
    if (!productId) return memory.alternativeSuppliers;
    return memory.alternativeSuppliers.filter((a) => a.product_id === productId);
  },

  // Inventory
  getInventory: async (filters = {}) => {
    if (isUsingSupabase) {
      try {
        let q = supabase.from('inventory').select('*').order('product_name', { ascending: true });
        if (filters.status) q = q.eq('status', filters.status);
        if (filters.warehouseId) q = q.eq('warehouse_id', filters.warehouseId);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          if (filters.search) {
            const query = filters.search.toLowerCase();
            return data.filter((i) =>
              (i.product_name && i.product_name.toLowerCase().includes(query)) ||
              (i.product_sku && i.product_sku.toLowerCase().includes(query))
            );
          }
          return data;
        }
      } catch (e) {
        console.warn('Supabase getInventory fallback:', e.message);
      }
    }
    let result = [...memory.inventory];
    if (filters.status) result = result.filter((i) => i.status === filters.status);
    if (filters.warehouseId) result = result.filter((i) => i.warehouse_id === filters.warehouseId);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((i) =>
        (i.product_name && i.product_name.toLowerCase().includes(q)) ||
        (i.product_sku && i.product_sku.toLowerCase().includes(q))
      );
    }
    return result;
  },

  updateInventoryStock: async (id, stockUpdates) => {
    const item = memory.inventory.find((i) => i.id === id);
    if (item) {
      Object.assign(item, stockUpdates);
      item.available_stock = item.current_stock - item.reserved_stock;
    }
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .update({ ...stockUpdates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateInventoryStock fallback:', e.message);
      }
    }
    return item || null;
  },

  // Customers & Orders
  getCustomers: async () => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('customers').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getCustomers fallback:', e.message);
      }
    }
    return memory.customers;
  },

  getOrders: async (filters = {}) => {
    if (isUsingSupabase) {
      try {
        let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (filters.status) q = q.eq('status', filters.status);
        if (filters.risk_status) q = q.eq('risk_status', filters.risk_status);
        if (filters.priority) q = q.eq('priority', filters.priority);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getOrders fallback:', e.message);
      }
    }
    let result = [...memory.orders];
    if (filters.status) result = result.filter((o) => o.status === filters.status);
    if (filters.risk_status) result = result.filter((o) => o.risk_status === filters.risk_status);
    if (filters.priority) result = result.filter((o) => o.priority === filters.priority);
    return result;
  },

  getOrderById: async (id) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`id.eq.${id},order_number.eq.${id}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getOrderById fallback:', e.message);
      }
    }
    return memory.orders.find((o) => o.id === id || o.order_number === id);
  },

  updateOrder: async (id, updates) => {
    const idx = memory.orders.findIndex((o) => o.id === id || o.order_number === id);
    if (idx !== -1) {
      memory.orders[idx] = { ...memory.orders[idx], ...updates, updated_at: new Date().toISOString() };
    }
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .or(`id.eq.${id},order_number.eq.${id}`)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateOrder fallback:', e.message);
      }
    }
    return idx !== -1 ? memory.orders[idx] : null;
  },

  // Shipments
  getShipments: async (filters = {}) => {
    if (isUsingSupabase) {
      try {
        let q = supabase.from('shipments').select('*').order('created_at', { ascending: false });
        if (filters.status) q = q.eq('status', filters.status);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getShipments fallback:', e.message);
      }
    }
    let result = [...memory.shipments];
    if (filters.status) result = result.filter((s) => s.status === filters.status);
    return result;
  },

  getShipmentById: async (id) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .or(`id.eq.${id},tracking_number.eq.${id}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getShipmentById fallback:', e.message);
      }
    }
    return memory.shipments.find((s) => s.id === id || s.tracking_number === id);
  },

  updateShipment: async (id, updates) => {
    const idx = memory.shipments.findIndex((s) => s.id === id || s.tracking_number === id);
    if (idx !== -1) {
      memory.shipments[idx] = { ...memory.shipments[idx], ...updates, updated_at: new Date().toISOString() };
    }
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .or(`id.eq.${id},tracking_number.eq.${id}`)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateShipment fallback:', e.message);
      }
    }
    return idx !== -1 ? memory.shipments[idx] : null;
  },

  // Disruptions
  getDisruptions: async () => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('disruptions').select('*').order('detected_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getDisruptions fallback:', e.message);
      }
    }
    return memory.disruptions;
  },

  getDisruptionById: async (id) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('disruptions')
          .select('*')
          .or(`id.eq.${id},code.eq.${id}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getDisruptionById fallback:', e.message);
      }
    }
    return memory.disruptions.find((d) => d.id === id || d.code === id);
  },

  createDisruption: async (data) => {
    const newDisruption = {
      id: data.id || `disrupt-${Date.now()}`,
      code: data.code || `DISRUPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: data.status || 'ACTIVE',
      detected_at: data.detected_at || new Date().toISOString(),
      ...data,
    };
    memory.disruptions.unshift(newDisruption);
    if (isUsingSupabase) {
      try {
        const { data: dbData, error } = await supabase.from('disruptions').insert(newDisruption).select().single();
        if (!error && dbData) return dbData;
      } catch (e) {
        console.warn('Supabase createDisruption fallback:', e.message);
      }
    }
    return newDisruption;
  },

  updateDisruption: async (id, updates) => {
    const idx = memory.disruptions.findIndex((d) => d.id === id || d.code === id);
    if (idx !== -1) {
      memory.disruptions[idx] = { ...memory.disruptions[idx], ...updates, updated_at: new Date().toISOString() };
    }
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('disruptions')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .or(`id.eq.${id},code.eq.${id}`)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateDisruption fallback:', e.message);
      }
    }
    return idx !== -1 ? memory.disruptions[idx] : null;
  },

  // AI Decisions
  getDecisions: async () => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('ai_decisions').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getDecisions fallback:', e.message);
      }
    }
    return memory.aiDecisions;
  },

  getDecisionById: async (id) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('ai_decisions')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getDecisionById fallback:', e.message);
      }
    }
    return memory.aiDecisions.find((d) => d.id === id);
  },

  createDecision: async (data) => {
    const newDecision = {
      id: data.id || `dec-${Date.now()}`,
      created_at: new Date().toISOString(),
      approval_status: data.requires_human_approval ? 'PENDING' : 'AUTO_EXECUTED',
      execution_status: data.requires_human_approval ? 'PENDING' : 'COMPLETED',
      ...data,
    };
    memory.aiDecisions.unshift(newDecision);
    if (isUsingSupabase) {
      try {
        const { data: dbData, error } = await supabase.from('ai_decisions').insert(newDecision).select().single();
        if (!error && dbData) return dbData;
      } catch (e) {
        console.warn('Supabase createDecision fallback:', e.message);
      }
    }
    return newDecision;
  },

  updateDecision: async (id, updates) => {
    const idx = memory.aiDecisions.findIndex((d) => d.id === id);
    if (idx !== -1) {
      memory.aiDecisions[idx] = { ...memory.aiDecisions[idx], ...updates, updated_at: new Date().toISOString() };
    }
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('ai_decisions')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateDecision fallback:', e.message);
      }
    }
    return idx !== -1 ? memory.aiDecisions[idx] : null;
  },

  // Simulations
  getSimulations: async () => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('simulations').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getSimulations fallback:', e.message);
      }
    }
    return memory.simulations;
  },

  createSimulation: async (data) => {
    const sim = {
      id: data.id || `sim-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...data,
    };
    memory.simulations.unshift(sim);
    if (isUsingSupabase) {
      try {
        const { data: dbData, error } = await supabase.from('simulations').insert(sim).select().single();
        if (!error && dbData) return dbData;
      } catch (e) {
        console.warn('Supabase createSimulation fallback:', e.message);
      }
    }
    return sim;
  },

  // Audit Logs
  getAuditLogs: async (limit = 100) => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limit);
        if (!error && data && data.length > 0) {
          return data.map((l) => ({
            ...l,
            user_name: l.user_name || 'SupplyChain Guardian AI',
          }));
        }
      } catch (e) {
        console.warn('Supabase getAuditLogs fallback:', e.message);
      }
    }
    return memory.auditLogs.slice(0, limit).map((l) => ({
      ...l,
      user_name: l.user_name || 'SupplyChain Guardian AI',
    }));
  },

  createAuditLog: async (log) => {
    const newLog = {
      id: log.id || `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      user_name: log.user_name || 'SupplyChain Guardian AI',
      result_status: log.result_status || 'SUCCESS',
      ...log,
    };
    memory.auditLogs.unshift(newLog);
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').insert(newLog).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase createAuditLog fallback:', e.message);
      }
    }
    return newLog;
  },

  // Notifications
  getNotifications: async () => {
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getNotifications fallback:', e.message);
      }
    }
    return memory.notifications;
  },

  createNotification: async (notif) => {
    const newNotif = {
      id: notif.id || `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
      ...notif,
    };
    memory.notifications.unshift(newNotif);
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('notifications').insert(newNotif).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase createNotification fallback:', e.message);
      }
    }
    return newNotif;
  },

  markNotificationRead: async (id) => {
    const item = memory.notifications.find((n) => n.id === id);
    if (item) {
      item.is_read = true;
    }
    if (isUsingSupabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase markNotificationRead fallback:', e.message);
      }
    }
    return item || null;
  },

  markAllNotificationsRead: async () => {
    memory.notifications.forEach((n) => { n.is_read = true; });
    if (isUsingSupabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).neq('id', '');
      } catch (e) {
        console.warn('Supabase markAllNotificationsRead fallback:', e.message);
      }
    }
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
