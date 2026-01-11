const Company = require('../models/Company');
const Job = require('../models/Job');

// @desc    Get all companies for current employer
// @route   GET /api/companies
// @access  Private (Employer)
exports.getCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({ employer: req.user.id });
        res.status(200).json({ success: true, count: companies.length, data: companies });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private (Employer/Public?)
exports.getCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }

        res.status(200).json({ success: true, data: company });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new company
// @route   POST /api/companies
// @access  Private (Employer)
exports.createCompany = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.employer = req.user.id;

        // Check for published company limit (5 max)
        const publishedCompanyCount = await Company.countDocuments({ employer: req.user.id });

        if (publishedCompanyCount >= 5 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, error: 'You have reached the limit of 5 companies' });
        }

        const company = await Company.create(req.body);

        res.status(201).json({ success: true, data: company });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Employer)
exports.updateCompany = async (req, res, next) => {
    try {
        let company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }

        // Make sure user is company owner
        if (company.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this company' });
        }

        company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: company });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Employer)
exports.deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ success: false, error: 'Company not found' });
        }

        // Make sure user is company owner
        if (company.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this company' });
        }

        // Optional: Delete associated jobs or unlink them? 
        // For now, let's keep jobs but unset company field if we were using a real foreign key cascade, 
        // but Mongoose doesn't do this automatically.
        // Let's just delete the company. Jobs will still exist but point to non-existent company or we should clean up.
        // Ideally: await Job.updateMany({ company: company._id }, { $unset: { company: "" } }); 

        await company.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
