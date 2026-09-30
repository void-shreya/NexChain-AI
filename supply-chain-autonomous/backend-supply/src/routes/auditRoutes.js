const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { optionalAuthenticate } = require('../middleware/authMiddleware');

router.get('/', optionalAuthenticate, auditController.getAuditLogs);

module.exports = router;
