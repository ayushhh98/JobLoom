const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    course: {
        type: String,
        required: [true, 'Please add a course']
    },
    rollNumber: {
        type: String
    },
    year: {
        type: String
    },
    companyName: {
        type: String
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    certificateType: {
        type: String,
        default: 'Training'
    },
    certificateId: {
        type: String,
        unique: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Generated'],
        default: 'Pending'
    },
    pdfUrl: {
        type: String
    }
});

module.exports = mongoose.model('Student', StudentSchema);
