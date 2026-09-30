const { db } = require('../database/dbClient');

const getOrders = async (req, res, next) => {
  try {
    const { status, risk_status, priority, filter } = req.query;

    let orders = await db.getOrders({ status, risk_status, priority });

    if (filter === 'at_risk') {
      orders = orders.filter((o) => o.risk_status === 'HIGH_RISK' || o.risk_status === 'CRITICAL_DELAY');
    } else if (filter === 'delayed') {
      orders = orders.filter((o) => o.status === 'DELAYED' || (o.delay_hours && o.delay_hours > 0));
    } else if (filter === 'critical') {
      orders = orders.filter((o) => o.priority === 'CRITICAL');
    } else if (filter === 'completed') {
      orders = orders.filter((o) => o.status === 'DELIVERED');
    }

    const summary = {
      total: orders.length,
      critical: orders.filter((o) => o.priority === 'CRITICAL').length,
      highRisk: orders.filter((o) => o.risk_status === 'CRITICAL_DELAY' || o.risk_status === 'HIGH_RISK').length,
      delayed: orders.filter((o) => o.delay_hours > 0).length,
      totalValueInr: orders.reduce((sum, o) => sum + (o.total_amount_inr || 0), 0),
    };

    res.json({ success: true, summary, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Attach shipment if any
    const shipments = await db.getShipments();
    const shipment = shipments.find((s) => s.order_id === order.id);

    res.json({ success: true, data: { ...order, shipment } });
  } catch (err) {
    next(err);
  }
};

const reprioritizeOrders = async (req, res, next) => {
  try {
    const { orderIds, priorityLevel, reason } = req.body;
    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ success: false, error: 'orderIds array required' });
    }

    const updatedOrders = [];
    for (const id of orderIds) {
      const updated = await db.updateOrder(id, {
        priority: priorityLevel || 'CRITICAL',
        prioritization_reason: reason || 'Manual priority elevation by Operations Manager',
      });
      if (updated) updatedOrders.push(updated);
    }

    await db.createAuditLog({
      user_name: req.user?.full_name || 'Operations Lead',
      event_category: 'ORDER_REPRIORITIZATION',
      event_name: 'Manual Order Priority Escalation',
      input_context_summary: `Reprioritized ${orderIds.length} orders to ${priorityLevel}. Reason: ${reason}`,
      decision_summary: `Orders queued for immediate dispatch bypass and priority cross-dock allocation.`,
      action_taken: 'WMS fulfillment sequence updated.',
      approval_status: 'APPROVED',
    });

    res.json({ success: true, count: updatedOrders.length, data: updatedOrders });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  reprioritizeOrders,
};
