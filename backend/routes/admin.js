const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { verifyAccessToken } = require('../middleware/auth');

router.get('/dashboard', verifyAccessToken, adminController.getDashboardStats);

module.exports = router;
