const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['seeker', 'employer', 'admin', 'student'],
        default: 'seeker'
    },
    // Job Seeker Specifics
    resume: {
        type: String // Path to file
    },
    contact: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    profilePhoto: {
        type: String // Path to file
    },
    location: {
        type: String
    },
    headline: {
        type: String
    },
    skills: {
        type: [String] // Array of strings
    },
    // Enhanced Profile Data
    address: {
        type: String
    },
    education: {
        tenth: String,
        twelfth: String,
        sgpa: String
    },
    social: {
        github: String,
        linkedin: String,
        portfolio: String
    },
    about: {
        type: String
    },
    stats: {
        projects: { type: String, default: "0" },
        happyClients: { type: String, default: "0" },
        yearsExperience: { type: String, default: "0" },
        awards: { type: String, default: "0" }
    },
    // Employer Specifics
    companyName: String,
    companyDescription: String,
    mobile: String,
    companyDetails: {
        hiringFor: String,
        employees: String,
        designation: String,
        pincode: String,
        address: String
    },

    subscription: {
        plan: {
            type: String,
            default: 'Free'
        },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Expired'],
            default: 'Inactive'
        }
    },

    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileViews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = mongoose.model('User', UserSchema);
