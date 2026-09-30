/**
 * Supabase Data Seeding Script for NexChain AI
 * Connects via Supabase client using Service Role key and stores all core entities as relational tables.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const seedData = require('./seedData');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function seed() {
  console.log('🚀 Connecting to Supabase project at:', SUPABASE_URL);

  try {
    // 1. Roles
    console.log('📌 Seeding Roles...');
    const roles = [
      { id: 'ADMIN', name: 'System Administrator', description: 'Full platform administrative access' },
      { id: 'SUPPLY_MANAGER', name: 'Supply Chain Manager', description: 'Manage suppliers, inventory policies, and emergency procurement' },
      { id: 'OPERATIONS_MANAGER', name: 'Operations Manager', description: 'Control tower operations, dispatch, and shipment management' },
      { id: 'VIEWER', name: 'Viewer / Auditor', description: 'Read-only access to supply chain dashboard and audit records' },
    ];
    const { error: errRoles } = await supabase.from('roles').upsert(roles, { onConflict: 'id' });
    if (errRoles) throw new Error(`Roles error: ${errRoles.message}`);
    console.log(`  ✅ Roles seeded: ${roles.length}`);

    // 2. Users
    console.log('📌 Seeding Users...');
    const users = seedData.users.map((u) => ({
      id: u.id,
      email: u.email,
      password_hash: u.password_hash,
      full_name: u.full_name,
      role_id: u.role_id,
      avatar_url: u.avatar_url,
      is_active: u.is_active,
    }));
    const { error: errUsers } = await supabase.from('users').upsert(users, { onConflict: 'id' });
    if (errUsers) throw new Error(`Users error: ${errUsers.message}`);
    console.log(`  ✅ Users seeded: ${users.length}`);

    // 3. Warehouses
    console.log('📌 Seeding Warehouses...');
    const warehouses = seedData.warehouses.map((w) => ({
      id: w.id,
      code: w.code,
      name: w.name,
      city: w.city,
      state: w.state,
      country: w.country || 'India',
      latitude: w.latitude,
      longitude: w.longitude,
      total_capacity_units: w.total_capacity_units,
      utilized_capacity_units: w.utilized_capacity_units,
      operational_status: w.operational_status,
      contact_phone: w.contact_phone,
    }));
    const { error: errWh } = await supabase.from('warehouses').upsert(warehouses, { onConflict: 'id' });
    if (errWh) throw new Error(`Warehouses error: ${errWh.message}`);
    console.log(`  ✅ Warehouses seeded: ${warehouses.length}`);

    // 4. Suppliers
    console.log('📌 Seeding Suppliers...');
    const suppliers = seedData.suppliers.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      tier: s.tier,
      category: s.category,
      city: s.city,
      state: s.state,
      country: s.country || 'India',
      latitude: s.latitude,
      longitude: s.longitude,
      reliability_score: s.reliability_score,
      avg_lead_time_days: s.avg_lead_time_days,
      capacity_units_per_month: s.capacity_units_per_month,
      cost_index: s.cost_index,
      status: s.status,
      risk_level: s.risk_level,
      risk_factors: s.risk_factors,
      primary_contact: s.primary_contact,
    }));
    const { error: errSup } = await supabase.from('suppliers').upsert(suppliers, { onConflict: 'id' });
    if (errSup) throw new Error(`Suppliers error: ${errSup.message}`);
    console.log(`  ✅ Suppliers seeded: ${suppliers.length}`);

    // 5. Products
    console.log('📌 Seeding Products...');
    const products = seedData.products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      unit_cost_inr: p.unit_cost_inr,
      selling_price_inr: p.selling_price_inr,
      primary_supplier_id: p.primary_supplier_id,
      criticality: p.criticality,
      lead_time_days: p.lead_time_days,
    }));
    const { error: errProd } = await supabase.from('products').upsert(products, { onConflict: 'id' });
    if (errProd) throw new Error(`Products error: ${errProd.message}`);
    console.log(`  ✅ Products seeded: ${products.length}`);

    // 6. Alternative Suppliers
    console.log('📌 Seeding Alternative Suppliers...');
    const altSuppliers = seedData.alternativeSuppliers.map((alt, idx) => ({
      id: `alt-${idx + 1}`,
      product_id: alt.product_id,
      supplier_id: alt.supplier_id,
      preference_rank: alt.preference_rank,
      lead_time_days: alt.lead_time_days,
      unit_cost_inr: alt.unit_cost_inr,
      capacity_available: alt.capacity_available,
      carrier_expedite: alt.carrier_expedite,
      is_active: true,
    }));
    const { error: errAlt } = await supabase.from('alternative_suppliers').upsert(altSuppliers, { onConflict: 'id' });
    if (errAlt) throw new Error(`Alternative suppliers error: ${errAlt.message}`);
    console.log(`  ✅ Alternative Suppliers seeded: ${altSuppliers.length}`);

    // 7. Customers
    console.log('📌 Seeding Customers...');
    const customers = seedData.customers.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      tier: c.tier,
      sla_hours: c.sla_hours,
      penalty_per_day_inr: c.penalty_per_day_inr,
      city: c.city,
      state: c.state,
      latitude: c.latitude,
      longitude: c.longitude,
      contact_email: c.contact_email,
    }));
    const { error: errCust } = await supabase.from('customers').upsert(customers, { onConflict: 'id' });
    if (errCust) throw new Error(`Customers error: ${errCust.message}`);
    console.log(`  ✅ Customers seeded: ${customers.length}`);

    // 8. Inventory
    console.log('📌 Seeding Inventory (batch size 100)...');
    const inventory = seedData.inventory.map((inv) => ({
      id: inv.id,
      product_id: inv.product_id,
      product_name: inv.product_name,
      product_sku: inv.product_sku,
      warehouse_id: inv.warehouse_id,
      warehouse_name: inv.warehouse_name,
      warehouse_code: inv.warehouse_code,
      warehouse_city: inv.warehouse_city,
      current_stock: inv.current_stock,
      reserved_stock: inv.reserved_stock,
      available_stock: inv.available_stock,
      safety_stock_threshold: inv.safety_stock_threshold,
      reorder_point: inv.reorder_point,
      daily_demand_rate: inv.daily_demand_rate,
      days_of_supply: inv.days_of_supply,
      unit_cost_inr: inv.unit_cost_inr,
      revenue_at_risk_inr: inv.revenue_at_risk_inr,
      status: inv.status,
    }));

    for (let i = 0; i < inventory.length; i += 100) {
      const chunk = inventory.slice(i, i + 100);
      const { error: errInv } = await supabase.from('inventory').upsert(chunk, { onConflict: 'id' });
      if (errInv) throw new Error(`Inventory batch error: ${errInv.message}`);
    }
    console.log(`  ✅ Inventory items seeded: ${inventory.length}`);

    // 9. Orders & Order Items
    console.log('📌 Seeding Orders & Order Items...');
    const orders = [];
    const orderItems = [];

    seedData.orders.forEach((ord) => {
      orders.push({
        id: ord.id,
        order_number: ord.order_number,
        customer_id: ord.customer_id,
        customer_name: ord.customer_name,
        customer_tier: ord.customer_tier,
        customer_city: ord.customer_city,
        items: ord.items,
        total_amount_inr: ord.total_amount_inr,
        priority: ord.priority,
        status: ord.status,
        risk_status: ord.risk_status,
        promised_delivery_date: ord.promised_delivery_date,
        estimated_delivery_date: ord.estimated_delivery_date,
        delay_hours: ord.delay_hours || 0,
        sla_penalty_at_risk_inr: ord.sla_penalty_at_risk_inr || 0,
        prioritization_score: ord.prioritization_score,
        prioritization_reason: ord.prioritization_reason,
      });

      if (ord.items && Array.isArray(ord.items)) {
        ord.items.forEach((item, itemIdx) => {
          orderItems.push({
            id: `item-${ord.id}-${itemIdx + 1}`,
            order_id: ord.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price_inr: item.unit_price,
            allocated_warehouse_id: 'wh-01',
            fulfillment_status: ord.status === 'DELIVERED' ? 'DELIVERED' : 'ALLOCATED',
          });
        });
      }
    });

    const { error: errOrders } = await supabase.from('orders').upsert(orders, { onConflict: 'id' });
    if (errOrders) throw new Error(`Orders error: ${errOrders.message}`);
    console.log(`  ✅ Orders seeded: ${orders.length}`);

    const { error: errItems } = await supabase.from('order_items').upsert(orderItems, { onConflict: 'id' });
    if (errItems) throw new Error(`Order items error: ${errItems.message}`);
    console.log(`  ✅ Order Items seeded: ${orderItems.length}`);

    // 10. Shipments
    console.log('📌 Seeding Shipments...');
    const shipments = seedData.shipments.map((shp) => ({
      id: shp.id,
      tracking_number: shp.tracking_number,
      order_id: shp.order_id,
      carrier_name: shp.carrier_name,
      vehicle_type: shp.vehicle_type,
      vehicle_registration: shp.vehicle_registration,
      origin_name: shp.origin_name,
      destination_name: shp.destination_name,
      current_latitude: shp.current_latitude,
      current_longitude: shp.current_longitude,
      status: shp.status,
      speed_kmh: shp.speed_kmh,
      estimated_arrival: shp.estimated_arrival,
      delay_hours: shp.delay_hours || 0,
      cargo_temperature_celsius: shp.cargo_temperature_celsius,
      route_corridor: shp.route_corridor,
    }));
    const { error: errShp } = await supabase.from('shipments').upsert(shipments, { onConflict: 'id' });
    if (errShp) throw new Error(`Shipments error: ${errShp.message}`);
    console.log(`  ✅ Shipments seeded: ${shipments.length}`);

    // 11. Disruptions
    console.log('📌 Seeding Disruptions...');
    const disruptions = seedData.disruptions.map((dis) => ({
      id: dis.id,
      code: dis.code,
      title: dis.title,
      type: dis.type,
      severity: dis.severity,
      status: dis.status,
      source: dis.source,
      affected_entity_type: dis.affected_entity_type,
      affected_entity_id: dis.affected_entity_id,
      affected_entity_name: dis.affected_entity_name,
      latitude: dis.latitude,
      longitude: dis.longitude,
      radius_km: dis.radius_km,
      expected_duration_days: dis.expected_duration_days,
      estimated_loss_inr: dis.estimated_loss_inr,
      detected_at: dis.detected_at,
      resolved_at: dis.resolved_at,
      details: dis.details,
    }));
    const { error: errDis } = await supabase.from('disruptions').upsert(disruptions, { onConflict: 'id' });
    if (errDis) throw new Error(`Disruptions error: ${errDis.message}`);
    console.log(`  ✅ Disruptions seeded: ${disruptions.length}`);

    // 12. AI Decisions
    console.log('📌 Seeding AI Decisions...');
    const decisions = seedData.aiDecisions.map((dec) => ({
      id: dec.id,
      disruption_id: dec.disruption_id,
      agent_name: dec.agent_name,
      summary: dec.summary,
      severity: dec.severity,
      affected_orders: dec.affected_orders,
      affected_inventory: dec.affected_inventory,
      candidate_actions: dec.candidate_actions,
      selected_action: dec.selected_action,
      selected_action_title: dec.selected_action_title,
      reasoning_summary: dec.reasoning_summary,
      estimated_cost_inr: dec.estimated_cost_inr,
      estimated_delay_hours: dec.estimated_delay_hours,
      risk_level: dec.risk_level,
      confidence_score: dec.confidence_score,
      requires_human_approval: dec.requires_human_approval,
      approval_status: dec.approval_status,
      approved_by: dec.approved_by,
      approved_at: dec.approved_at,
      rejection_reason: dec.rejection_reason,
      execution_status: dec.execution_status,
      workflow_steps: dec.workflow_steps,
    }));
    const { error: errDec } = await supabase.from('ai_decisions').upsert(decisions, { onConflict: 'id' });
    if (errDec) throw new Error(`AI Decisions error: ${errDec.message}`);
    console.log(`  ✅ AI Decisions seeded: ${decisions.length}`);

    // 13. Audit Logs
    console.log('📌 Seeding Audit Logs...');
    const auditLogs = seedData.auditLogs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      user_id: null,
      user_name: log.user_name || 'SupplyChain Guardian AI',
      agent_id: log.agent_id,
      event_category: log.event_category,
      event_name: log.event_name,
      input_context_summary: log.input_context_summary,
      decision_summary: log.decision_summary,
      action_taken: log.action_taken,
      approval_status: log.approval_status,
      result_status: log.result_status,
      details: log.details,
    }));
    const { error: errLog } = await supabase.from('audit_logs').upsert(auditLogs, { onConflict: 'id' });
    if (errLog) throw new Error(`Audit Logs error: ${errLog.message}`);
    console.log(`  ✅ Audit Logs seeded: ${auditLogs.length}`);

    // 14. Notifications
    console.log('📌 Seeding Notifications...');
    const notifications = seedData.notifications.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      link: notif.link,
      is_read: notif.is_read,
      severity: notif.severity,
    }));
    const { error: errNotif } = await supabase.from('notifications').upsert(notifications, { onConflict: 'id' });
    if (errNotif) throw new Error(`Notifications error: ${errNotif.message}`);
    console.log(`  ✅ Notifications seeded: ${notifications.length}`);

    console.log('🎉 ALL TABLES IN SUPABASE HAVE BEEN SUCCESSFULLY POPULATED WITH NEXCHAIN DATA!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
