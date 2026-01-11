const Student = require('../models/Student');
const { generateCertificate } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

// @desc    Generate Certificate for a student
// @route   POST /api/cert/generate/:id
// @access  Protected
exports.generateCertificate = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Generate PDF
        const pdfUrl = await generateCertificate(student);

        // Update Student Record
        student.pdfUrl = pdfUrl;
        student.status = 'Generated';
        student.issueDate = Date.now();
        await student.save();

        res.status(200).json({ success: true, message: 'Certificate generated', data: student });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Certificate generation failed' });
    }
};

// @desc    Get Certificate by ID (Public Search)
// @route   GET /api/cert/search/:id
// @access  Public
exports.searchCertificate = async (req, res) => {
    try {
        const certId = req.params.id;
        // Search by certificateId or email
        const student = await Student.findOne({
            $or: [{ certificateId: certId }, { email: certId }]
        });

        if (!student || student.status !== 'Generated') {
            return res.status(404).json({ success: false, message: 'Certificate not found or not yet generated.' });
        }

        res.status(200).json({
            success: true,
            data: {
                name: student.name,
                course: student.course,
                issueDate: student.issueDate,
                certificateId: student.certificateId,
                pdfUrl: student.pdfUrl
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Secure Download Certificate
// @route   GET /api/cert/download/:id
// @access  Public (tracked)
exports.downloadCertificate = async (req, res) => {
    try {
        const student = await Student.findOne({ certificateId: req.params.id });

        if (!student || !student.pdfUrl) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        // Log the download (Simulated)
        console.log(`[Download] Cert: ${student.certificateId}, IP: ${req.ip}, Time: ${new Date().toISOString()}`);

        // If it's a local file path starting with /certificates/
        if (student.pdfUrl.startsWith('/certificates/')) {
            const filePath = path.join(__dirname, '../public', student.pdfUrl);
            if (fs.existsSync(filePath)) {
                return res.download(filePath);
            }
        }

        // Fallback for external URLs or if local file missing
        res.redirect(student.pdfUrl);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
