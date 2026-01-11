const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    qualifications: {
        type: String,
        required: [true, 'Please add qualifications']
    },
    responsibilities: {
        type: String,
        required: [true, 'Please add responsibilities']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    salaryRange: {
        type: String,
        required: [true, 'Please add a salary range']
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time'
    },
    employer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    skills: {
        type: [String],
        default: []
    },
    experienceLevel: {
        type: String,
        enum: ['Entry Level', 'Mid-Level', 'Senior Level', 'Executive'],
        default: 'Mid-Level'
    },
    salaryCurrency: {
        type: String,
        default: 'USD'
    },
    companyLogo: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Reverse populate with virtuals
JobSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'job',
    justOne: false
});

module.exports = mongoose.model('Job', JobSchema);
