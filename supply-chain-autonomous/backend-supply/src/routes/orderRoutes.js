const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/reprioritize', authenticate, authorize('ADMIN', 'OPERATIONS_MANAGER', 'SUPPLY_MANAGER'), orderController.reprioritizeOrders);

module.exports = router;
