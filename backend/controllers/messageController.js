const Message = require('../models/Message');
const User = require('../models/User');
const { getIO } = require('../utils/socket');

// @desc    Get chat history with a specific user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, recipient: userId },
                { sender: userId, recipient: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { recipientId, content } = req.body;

        const message = await Message.create({
            sender: req.user.id,
            recipient: recipientId,
            content
        });

        // Real-time Socket Event
        try {
            const io = getIO();
            io.to(recipientId).emit('receive_message', message);
        } catch (e) {
            console.error("Socket emit failed", e);
        }

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
