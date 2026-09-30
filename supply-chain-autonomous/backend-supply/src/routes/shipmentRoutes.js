const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, shipmentController.getShipments);
router.get('/:id', authenticate, shipmentController.getShipmentById);
router.patch('/:id/telemetry', authenticate, shipmentController.updateShipmentTelemetry);

module.exports = router;
