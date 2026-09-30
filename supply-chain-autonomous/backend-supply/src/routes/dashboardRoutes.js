const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { optionalAuthenticate } = require('../middleware/authMiddleware');

router.get('/', optionalAuthenticate, dashboardController.getDashboardMetrics);

module.exports = router;
