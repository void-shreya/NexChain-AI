const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decisionController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, decisionController.getDecisions);
router.get('/:id', authenticate, decisionController.getDecisionById);

module.exports = router;
