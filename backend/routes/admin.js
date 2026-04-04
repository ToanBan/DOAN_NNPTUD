const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { verifyAccessToken, verifyAdmin } = require('../middleware/auth');



router.get('/dashboard', verifyAccessToken, verifyAdmin, adminController.getDashboardStats);
router.get('/users', verifyAccessToken, verifyAdmin, adminController.getUsersList);
router.patch('/users/:userId/toggle-status', verifyAccessToken, verifyAdmin, adminController.toggleUserStatus);
router.get('/posts', verifyAccessToken, verifyAdmin, adminController.getPostsList);

module.exports = router;
