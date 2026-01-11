const express = require('express');
const {
    getUserNotifications,
    markAsRead,
    scheduleInterview,
    sendMessage
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/')
    .get(getUserNotifications);

router.route('/:id/read')
    .put(markAsRead);

router.route('/schedule')
    .post(authorize('employer', 'recruiter', 'admin'), scheduleInterview);

router.route('/message')
    .post(authorize('employer', 'recruiter', 'admin'), sendMessage);

module.exports = router;
