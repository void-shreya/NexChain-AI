const { db } = require('../database/dbClient');

const getInventoryList = async (req, res, next) => {
  try {
    const { status, warehouseId, search } = req.query;
    const inventory = await db.getInventory({ status, warehouseId, search });

    // Summary counts
    const summary = {
      totalItems: inventory.length,
      safe: inventory.filter((i) => i.status === 'SAFE').length,
      watch: inventory.filter((i) => i.status === 'WATCH').length,
      atRisk: inventory.filter((i) => i.status === 'AT_RISK').length,
      stockoutRisk: inventory.filter((i) => i.status === 'STOCKOUT_RISK').length,
      totalRevenueAtRiskInr: inventory.reduce((sum, i) => sum + (i.revenue_at_risk_inr || 0), 0),
    };

    res.json({ success: true, summary, count: inventory.length, data: inventory });
  } catch (err) {
    next(err);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adjustmentQuantity, reason } = req.body;

    const inventory = await db.getInventory();
    const item = inventory.find((i) => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory record not found' });
    }

    const newStock = Math.max(0, item.current_stock + Number(adjustmentQuantity || 0));
    const daysOfSupply = item.daily_demand_rate > 0 ? (newStock / item.daily_demand_rate).toFixed(1) : 99;
    let newStatus = 'SAFE';
    if (daysOfSupply < 3) newStatus = 'STOCKOUT_RISK';
    else if (daysOfSupply < 7) newStatus = 'AT_RISK';
    else if (daysOfSupply < 14) newStatus = 'WATCH';

    const updated = await db.updateInventoryStock(id, {
      current_stock: newStock,
      days_of_supply: parseFloat(daysOfSupply),
      status: newStatus,
    });

    // Create Audit Log
    await db.createAuditLog({
      user_name: req.user?.full_name || 'Supply Chain Manager',
      event_category: 'INVENTORY_ADJUSTMENT',
      event_name: 'Manual Stock Adjustment',
      input_context_summary: `Adjusted SKU ${item.product_sku} by ${adjustmentQuantity} units at ${item.warehouse_code}. Reason: ${reason || 'Physical cycle count'}`,
      decision_summary: `Stock updated to ${newStock} units (${daysOfSupply} days remaining).`,
      action_taken: 'Inventory levels updated in ERP ledger.',
      approval_status: 'AUTO_EXECUTED',
    });

    res.json({ success: true, message: 'Stock adjusted successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInventoryList,
  adjustStock,
};
