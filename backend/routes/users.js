const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { verifyAccessToken } = require('../middleware/auth');

router.get('/search', verifyAccessToken, userController.searchUsers);
router.get('/profile/:id', verifyAccessToken, userController.getProfile);
router.post('/follow/:id', verifyAccessToken, userController.toggleFollow);
router.get('/friends', verifyAccessToken, userController.getFriends);
router.get('/notifications', verifyAccessToken, userController.getNotifications);
router.put('/notifications/read', verifyAccessToken, userController.markNotificationsAsRead);

module.exports = router;
