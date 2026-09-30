const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', authenticate, supplierController.getSuppliers);
router.get('/:id', authenticate, supplierController.getSupplierById);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'SUPPLY_MANAGER', 'OPERATIONS_MANAGER'), supplierController.updateSupplierStatus);

module.exports = router;
