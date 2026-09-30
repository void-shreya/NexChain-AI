const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/analyze', authenticate, agentController.analyzeDisruption);
router.post('/command', authenticate, agentController.processCommand);
router.post('/approve', authenticate, authorize('ADMIN', 'SUPPLY_MANAGER', 'OPERATIONS_MANAGER'), agentController.approveAction);
router.post('/reject', authenticate, authorize('ADMIN', 'SUPPLY_MANAGER', 'OPERATIONS_MANAGER'), agentController.rejectAction);
router.post('/mode', authenticate, authorize('ADMIN', 'SUPPLY_MANAGER', 'OPERATIONS_MANAGER'), agentController.configureMode);

module.exports = router;
