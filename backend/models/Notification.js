const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['interview', 'message', 'application_update', 'general'],
        default: 'general'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    meta: {
        // Dynamic field for extra data like interviewLink, jobId, etc.
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        interviewDate: Date,
        interviewLink: String,
        applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
