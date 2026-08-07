const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/summary', authenticateToken, dashboardController.getDashboardSummary);

module.exports = router;
