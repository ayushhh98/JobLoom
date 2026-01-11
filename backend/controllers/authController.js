const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, companyName, mobile, companyDetails } = req.body;

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        console.log('--------------------------------');
        console.log('GENERATED OTP:', otp);
        console.log('--------------------------------');

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ success: false, error: 'Email already exists' });
            }
            // User exists but not verified - Update details and resend OTP
            user.name = name;
            user.password = password; // Request will trigger pre-save hash
            user.role = role;
            user.companyName = role === 'employer' ? companyName : undefined;
            user.mobile = role === 'employer' ? mobile : undefined;
            user.companyDetails = role === 'employer' ? companyDetails : undefined;
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                password,
                role,
                companyName: role === 'employer' ? companyName : undefined,
                mobile: role === 'employer' ? mobile : undefined,
                companyDetails: role === 'employer' ? companyDetails : undefined,
                otp,
                otpExpires,
                isVerified: false
            });
        }

        // Send OTP email
        const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
        const verifyLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

        const message = `Your verification code is: ${otp}\n\nOr click here to verify: ${verifyLink}`;
        try {
            await sendEmail({
                email: user.email,
                subject: 'JobLoom Account Verification',
                message,
                html: `
                    <h3>Your verification code is: <span style="color: #4f46e5;">${otp}</span></h3>
                    <p>It expires in 10 minutes.</p>
                    <p>Or verify directly by clicking below:</p>
                    <a href="${verifyLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                `
            });

            res.status(200).json({
                success: true,
                message: 'Registration successful. OTP sent to email.',
                email: user.email
            });
        } catch (error) {
            console.error(error);
            res.status(200).json({
                success: true,
                message: 'Registration successful. Email could not be sent (check console).',
                email: user.email,
                debugOtp: otp // REMOVE THIS IN PRODUCTION
            });
        }

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Verify Email via JWT Token
// @route   POST /api/auth/verify-token
// @access  Public
exports.verifyEmailToken = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid token' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, error: 'User already verified' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        const message = `Your verification code is: ${otp}`;
        try {
            await sendEmail({
                email: user.email,
                subject: 'JobLoom Account Verification (Resend)',
                message,
                html: `<h3>Your new verification code is: <span style="color: #4f46e5;">${otp}</span></h3><p>It expires in 10 minutes.</p>`
            });

            res.status(200).json({
                success: true,
                message: 'OTP resent successfully.',
                email: user.email
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Email could not be sent' });
        }

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(401).json({ success: false, error: 'Email not verified. Please verify your email.' });
            // Ideally provide a way to resend OTP here
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000), // 5 seconds
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};
