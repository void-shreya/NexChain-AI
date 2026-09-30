const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, inventoryController.getInventoryList);
router.post('/:id/adjust', authenticate, authorize('ADMIN', 'SUPPLY_MANAGER', 'OPERATIONS_MANAGER'), inventoryController.adjustStock);

module.exports = router;
