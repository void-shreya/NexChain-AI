const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/run', authenticate, simulationController.runSimulation);
router.get('/history', authenticate, simulationController.getSimulationHistory);

module.exports = router;
