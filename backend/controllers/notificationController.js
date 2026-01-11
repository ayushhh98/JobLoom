const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name companyName profilePhoto')
            .populate('meta.jobId', 'title');

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        // Make sure user owns notification
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Schedule Interview (Creates Notification)
// @route   POST /api/notifications/schedule
// @access  Private (Employer/Recruiter)
exports.scheduleInterview = async (req, res) => {
    try {
        const { candidateId, title, message, date, link, jobId } = req.body;

        const notification = await Notification.create({
            recipient: candidateId,
            sender: req.user.id,
            type: 'interview',
            title: title || 'Interview Scheduled',
            message: message,
            meta: {
                interviewDate: date,
                interviewLink: link,
                jobId: jobId
            }
        });

        res.status(201).json({ success: true, data: notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to schedule interview' });
    }
};

// @desc    Send Direct Message (Creates Notification)
// @route   POST /api/notifications/message
// @access  Private (Employer/Recruiter)
exports.sendMessage = async (req, res) => {
    try {
        const { candidateId, title, message, jobId } = req.body;

        const notification = await Notification.create({
            recipient: candidateId,
            sender: req.user.id,
            type: 'message',
            title: title || 'New Message',
            message: message,
            meta: {
                jobId: jobId
            }
        });

        res.status(201).json({ success: true, data: notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};
