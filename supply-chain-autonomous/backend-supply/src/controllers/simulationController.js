const { db } = require('../database/dbClient');
const { decisionEngine } = require('../agents/decisionEngine');

const runSimulation = async (req, res, next) => {
  try {
    const {
      scenarioType,
      supplierId,
      delayDays,
      warehouseId,
      demandSurgePercent,
      transportDelayHours,
    } = req.body;

    const [suppliers, products, inventory, orders, customers, disruptions] = await Promise.all([
      db.getSuppliers(),
      db.getProducts(),
      db.getInventory(),
      db.getOrders(),
      db.getCustomers(),
      db.getDisruptions(),
    ]);

    // Choose target disruption or create a dynamic baseline
    const targetSupplier = suppliers.find((s) => s.id === supplierId || s.code === supplierId) || suppliers[0];
    const targetDisruption = disruptions.find((d) => d.affected_entity_id === targetSupplier.id) || {
      id: `sim-disrupt-${Date.now()}`,
      title: `Simulation: ${scenarioType || 'Supplier Shutdown'} at ${targetSupplier.name}`,
      affected_entity_id: targetSupplier.id,
      expected_duration_days: delayDays || 5,
    };

    const simulationResult = decisionEngine.simulateScenario({
      disruption: targetDisruption,
      parameterOverrides: {
        delayDays: delayDays || 5,
        supplierId: targetSupplier.id,
      },
      suppliers,
      products,
      inventory,
      orders,
      customers,
    });

    // Save simulation record
    const savedSim = await db.createSimulation({
      name: `${scenarioType || 'Disruption Simulation'} - ${targetSupplier.name} (+${delayDays || 5}d)`,
      scenario_type: scenarioType || 'SUPPLIER_SHUTDOWN',
      input_parameters: req.body,
      baseline_scenario: simulationResult.baselineScenario,
      recovery_scenario: simulationResult.recoveryScenario,
      delta_metrics: simulationResult.deltaMetrics,
      created_by: req.user?.id,
    });

    res.json({
      success: true,
      data: {
        simulationId: savedSim.id,
        ...simulationResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getSimulationHistory = async (req, res, next) => {
  try {
    const simulations = await db.getSimulations();
    res.json({ success: true, count: simulations.length, data: simulations });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  runSimulation,
  getSimulationHistory,
};
