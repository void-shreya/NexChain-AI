const { db } = require('../database/dbClient');

const getDashboardMetrics = async (req, res, next) => {
  try {
    const [orders, inventory, suppliers, shipments, disruptions, decisions, auditLogs] = await Promise.all([
      db.getOrders(),
      db.getInventory(),
      db.getSuppliers(),
      db.getShipments(),
      db.getDisruptions(),
      db.getDecisions(),
      db.getAuditLogs(10),
    ]);

    // KPI Aggregations
    const totalOrders = orders.length;
    const atRiskOrders = orders.filter((o) => o.risk_status === 'HIGH_RISK' || o.risk_status === 'CRITICAL_DELAY');
    const delayedOrders = orders.filter((o) => o.status === 'DELAYED' || (o.delay_hours && o.delay_hours > 0));
    const activeDisruptions = disruptions.filter((d) => d.status === 'ACTIVE');
    const lowInventoryItems = inventory.filter((i) => i.status === 'AT_RISK' || i.status === 'STOCKOUT_RISK');
    const highRiskSuppliers = suppliers.filter((s) => s.risk_level === 'HIGH' || s.risk_level === 'CRITICAL');
    const activeShipments = shipments.filter((s) => s.status !== 'DELIVERED');
    const delayedShipments = shipments.filter((s) => s.status === 'DELAYED' || s.status === 'AT_RISK');

    // Financial Metrics
    const totalRevenueAtRiskInr = atRiskOrders.reduce((sum, o) => sum + (o.total_amount_inr || 0), 0);
    const totalSlaPenaltyAtRiskInr = atRiskOrders.reduce((sum, o) => sum + (o.sla_penalty_at_risk_inr || 0), 0);
    const estimatedRecoveryCostInr = decisions[0]?.estimated_cost_inr || 1845000;

    // Service Level & On-Time Delivery
    const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
    const onTimeOrders = orders.filter((o) => o.risk_status === 'ON_TRACK');
    const onTimeDeliveryRate = totalOrders > 0 ? ((onTimeOrders.length / totalOrders) * 100).toFixed(1) : '94.2';
    const serviceLevelRate = '96.8';

    // 1. Inventory Health Distribution Chart Data
    const inventoryHealth = [
      { name: 'Safe Stock (>15 days)', count: inventory.filter((i) => i.status === 'SAFE').length, color: '#10b981' },
      { name: 'Watch List (7-14 days)', count: inventory.filter((i) => i.status === 'WATCH').length, color: '#f59e0b' },
      { name: 'At Risk (3-6 days)', count: inventory.filter((i) => i.status === 'AT_RISK').length, color: '#f97316' },
      { name: 'Stockout Critical (<3 days)', count: inventory.filter((i) => i.status === 'STOCKOUT_RISK').length, color: '#ef4444' },
    ];

    // 2. Supplier Risk Breakdown Chart Data
    const supplierRiskDistribution = [
      { name: 'Low Risk', count: suppliers.filter((s) => s.risk_level === 'LOW').length, color: '#10b981' },
      { name: 'Medium Risk', count: suppliers.filter((s) => s.risk_level === 'MEDIUM').length, color: '#f59e0b' },
      { name: 'High Risk', count: suppliers.filter((s) => s.risk_level === 'HIGH').length, color: '#f97316' },
      { name: 'Critical Risk', count: suppliers.filter((s) => s.risk_level === 'CRITICAL').length, color: '#ef4444' },
    ];

    // 3. Delivery Performance Trend Chart Data (Last 6 Months)
    const deliveryPerformanceTrend = [
      { month: 'Apr 2026', onTimeRate: 98.2, target: 95.0, disruptions: 1 },
      { month: 'May 2026', onTimeRate: 97.4, target: 95.0, disruptions: 2 },
      { month: 'Jun 2026', onTimeRate: 95.8, target: 95.0, disruptions: 4 },
      { month: 'Jul 2026', onTimeRate: 96.1, target: 95.0, disruptions: 3 },
      { month: 'Aug 2026', onTimeRate: 94.6, target: 95.0, disruptions: 5 },
      { month: 'Sep 2026', onTimeRate: parseFloat(onTimeDeliveryRate), target: 95.0, disruptions: activeDisruptions.length },
    ];

    // 4. Order Risk Distribution
    const orderRiskDistribution = [
      { name: 'On Track', value: orders.filter((o) => o.risk_status === 'ON_TRACK').length, color: '#10b981' },
      { name: 'Under Watch', value: orders.filter((o) => o.risk_status === 'WATCH').length, color: '#f59e0b' },
      { name: 'High Risk', value: orders.filter((o) => o.risk_status === 'HIGH_RISK').length, color: '#f97316' },
      { name: 'Critical Delay', value: orders.filter((o) => o.risk_status === 'CRITICAL_DELAY').length, color: '#ef4444' },
    ];

    // 5. Recovery Cost Comparison
    const recoveryCostComparison = [
      { scenario: 'Unmitigated Loss', amountLakhs: (totalRevenueAtRiskInr / 100000).toFixed(1) },
      { scenario: 'SLA Penalties', amountLakhs: (totalSlaPenaltyAtRiskInr / 100000).toFixed(1) },
      { scenario: 'AI Recovery Cost', amountLakhs: (estimatedRecoveryCostInr / 100000).toFixed(1) },
      { scenario: 'Net Savings', amountLakhs: (((totalRevenueAtRiskInr + totalSlaPenaltyAtRiskInr) - estimatedRecoveryCostInr) / 100000).toFixed(1) },
    ];

    // Disruption Timeline Items
    const timeline = [
      { time: '10:42 AM', title: 'Disruption Detected', desc: 'Pune Chakan power grid outage', badge: 'ALERT', status: 'done' },
      { time: '10:43 AM', title: 'Impact Assessment', desc: '18 customer orders isolated', badge: 'PREDICT', status: 'done' },
      { time: '10:44 AM', title: 'Inventory Shortage Flagged', desc: 'Bhiwandi & Chennai depots <2 days stock', badge: 'CRITICAL', status: 'done' },
      { time: '10:45 AM', title: 'Secondary Suppliers Queried', desc: 'Bharat Silicon BLR & Foxconn identified', badge: 'SIMULATE', status: 'done' },
      { time: '10:46 AM', title: 'AI Strategy Selected', desc: 'Option B: Bharat Silicon + Blue Dart Air', badge: 'DECIDE', status: 'done' },
      { time: '10:47 AM', title: 'Human Approval Request Dispatched', desc: 'Waiting authorization for PO-REC-901', badge: 'PENDING', status: 'pending' },
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          totalOrders,
          atRiskOrdersCount: atRiskOrders.length,
          delayedOrdersCount: delayedOrders.length,
          activeDisruptionsCount: activeDisruptions.length,
          lowInventoryCount: lowInventoryItems.length,
          highRiskSuppliersCount: highRiskSuppliers.length,
          activeShipmentsCount: activeShipments.length,
          delayedShipmentsCount: delayedShipments.length,
          totalRevenueAtRiskInr,
          totalSlaPenaltyAtRiskInr,
          estimatedRecoveryCostInr,
          onTimeDeliveryRate: `${onTimeDeliveryRate}%`,
          serviceLevelRate: `${serviceLevelRate}%`,
          aiActionsTaken: decisions.length,
        },
        charts: {
          inventoryHealth,
          supplierRiskDistribution,
          deliveryPerformanceTrend,
          orderRiskDistribution,
          recoveryCostComparison,
        },
        activeDisruptions,
        latestDecision: decisions[0] || null,
        timeline,
        recentAuditLogs: auditLogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardMetrics,
};
