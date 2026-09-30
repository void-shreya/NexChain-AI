const express = require('express');
const router = express.Router();
const disruptionController = require('../controllers/disruptionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, disruptionController.getDisruptions);
router.get('/:id', authenticate, disruptionController.getDisruptionById);
router.post('/', authenticate, authorize('ADMIN', 'OPERATIONS_MANAGER', 'SUPPLY_MANAGER'), disruptionController.createDisruption);
router.post('/demo/trigger', authenticate, disruptionController.triggerDemoDisruption);
router.patch('/:id/resolve', authenticate, authorize('ADMIN', 'OPERATIONS_MANAGER', 'SUPPLY_MANAGER'), disruptionController.resolveDisruption);

module.exports = router;
