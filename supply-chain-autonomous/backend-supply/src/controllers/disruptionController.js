const { db } = require('../database/dbClient');
const { supplyChainGuardian } = require('../agents/supplyChainGuardian');

const getDisruptions = async (req, res, next) => {
  try {
    const disruptions = await db.getDisruptions();
    res.json({ success: true, count: disruptions.length, data: disruptions });
  } catch (err) {
    next(err);
  }
};

const getDisruptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const disruption = await db.getDisruptionById(id);
    if (!disruption) {
      return res.status(404).json({ success: false, error: 'Disruption incident not found' });
    }
    res.json({ success: true, data: disruption });
  } catch (err) {
    next(err);
  }
};

const createDisruption = async (req, res, next) => {
  try {
    const { title, type, severity, affected_entity_name, affected_entity_type, latitude, longitude, expected_duration_days, estimated_loss_inr } = req.body;

    const newDisruption = await db.createDisruption({
      title: title || 'Custom Regional Disruption Event',
      type: type || 'SUPPLIER_DELAY',
      severity: severity || 'HIGH',
      status: 'ACTIVE',
      source: 'MANUAL_OPERATOR_REPORT',
      affected_entity_type: affected_entity_type || 'SUPPLIER',
      affected_entity_name: affected_entity_name || 'Regional Supply Node',
      latitude: latitude || 18.5204,
      longitude: longitude || 73.8567,
      radius_km: 30,
      expected_duration_days: expected_duration_days || 4,
      estimated_loss_inr: estimated_loss_inr || 15000000,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('disruption:new', newDisruption);
    }

    res.status(201).json({ success: true, message: 'Disruption incident created', data: newDisruption });
  } catch (err) {
    next(err);
  }
};

/**
 * DEMO DISRUPTION ENDPOINT (THE SHOWCASE HACKATHON TRIGGER)
 * Re-triggers or initiates the showcase Pune flood / Foxconn shutdown disruption,
 * runs the 15-step agentic workflow, and broadcasts to all clients.
 */
const triggerDemoDisruption = async (req, res, next) => {
  try {
    const io = req.app.get('io');

    // 1. Reset demo state or set Pune supplier to CRITICAL_SHUTDOWN
    await db.updateSupplier('sup-01', {
      status: 'CRITICAL_SHUTDOWN',
      risk_level: 'CRITICAL',
    });

    // 2. Mark demo disruption as active
    let demoDisruption = await db.getDisruptionById('disrupt-01');
    if (!demoDisruption) {
      demoDisruption = await db.createDisruption({
        title: 'Flash Flood & Substation Grid Outage at Pune Industrial Hub',
        type: 'SUPPLIER_SHUTDOWN',
        severity: 'CRITICAL',
        affected_entity_type: 'SUPPLIER',
        affected_entity_id: 'sup-01',
        affected_entity_name: 'Tata AutoComp Systems Ltd (Chakan Plant)',
        latitude: 18.7500,
        longitude: 73.8500,
        expected_duration_days: 5,
        estimated_loss_inr: 24500000,
      });
    } else {
      await db.updateDisruption('disrupt-01', {
        status: 'ACTIVE',
        detected_at: new Date().toISOString(),
      });
    }

    // 3. Mark affected orders as AT_RISK
    const orders = await db.getOrders();
    for (const ord of orders) {
      if (ord.items && ord.items.some((i) => ['NX-MCU-3200', 'NX-BMS-48V', 'NX-CAN-BUS'].includes(i.sku))) {
        await db.updateOrder(ord.id, {
          status: 'AT_RISK',
          risk_status: ord.customer_tier === 'TIER_1_ENTERPRISE' ? 'CRITICAL_DELAY' : 'HIGH_RISK',
          delay_hours: 120,
        });
      }
    }

    // 4. Mark affected shipment as AT_RISK / Stranded
    await db.updateShipment('shp-02', {
      status: 'AT_RISK',
      speed_kmh: 0.0,
      delay_hours: 48,
    });

    if (io) {
      io.emit('demo:disruption_triggered', { disruption: demoDisruption });
    }

    // 5. Execute 15-step agentic workflow asynchronously with socket broadcast
    const workflowResult = await supplyChainGuardian.runAutonomousWorkflow(demoDisruption.id, io);

    res.json({
      success: true,
      message: 'Demo disruption initiated and autonomous 15-step agentic recovery workflow executed.',
      data: {
        disruption: demoDisruption,
        workflowResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

const resolveDisruption = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolved = await db.updateDisruption(id, {
      status: 'RESOLVED',
      resolved_at: new Date().toISOString(),
    });

    if (!resolved) {
      return res.status(404).json({ success: false, error: 'Disruption not found' });
    }

    await db.createNotification({
      title: 'Disruption Resolved',
      message: `${resolved.title} has been officially cleared. Operations normalized.`,
      type: 'SUCCESS',
      severity: 'LOW',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('disruption:resolved', resolved);
    }

    res.json({ success: true, message: 'Disruption marked as resolved', data: resolved });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDisruptions,
  getDisruptionById,
  createDisruption,
  triggerDemoDisruption,
  resolveDisruption,
};
