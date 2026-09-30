const express = require('express');
const router = express.Router();
const disruptionController = require('../controllers/disruptionController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', optionalAuthenticate, disruptionController.getDisruptions);
router.get('/:id', optionalAuthenticate, disruptionController.getDisruptionById);
router.post('/', authenticate, authorize('ADMIN', 'OPERATIONS_MANAGER', 'SUPPLY_MANAGER'), disruptionController.createDisruption);
router.post('/demo/trigger', authenticate, disruptionController.triggerDemoDisruption);
router.patch('/:id/resolve', authenticate, authorize('ADMIN', 'OPERATIONS_MANAGER', 'SUPPLY_MANAGER'), disruptionController.resolveDisruption);

module.exports = router;
