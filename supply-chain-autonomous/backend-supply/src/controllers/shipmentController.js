const { db } = require('../database/dbClient');

const getShipments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const shipments = await db.getShipments({ status });

    const summary = {
      total: shipments.length,
      inTransit: shipments.filter((s) => s.status === 'IN_TRANSIT').length,
      delayed: shipments.filter((s) => s.status === 'DELAYED').length,
      atRisk: shipments.filter((s) => s.status === 'AT_RISK').length,
      delivered: shipments.filter((s) => s.status === 'DELIVERED').length,
    };

    res.json({ success: true, summary, count: shipments.length, data: shipments });
  } catch (err) {
    next(err);
  }
};

const getShipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shipment = await db.getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

const updateShipmentTelemetry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { current_latitude, current_longitude, speed_kmh, status, delay_hours } = req.body;

    const updated = await db.updateShipment(id, {
      current_latitude,
      current_longitude,
      speed_kmh,
      status,
      delay_hours,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    // Broadcast via global io if available
    const io = req.app.get('io');
    if (io) {
      io.emit('shipment:telemetry', updated);
    }

    res.json({ success: true, message: 'Shipment telemetry updated', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShipments,
  getShipmentById,
  updateShipmentTelemetry,
};
