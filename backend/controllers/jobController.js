const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');
const axios = require('axios');
const { getIO } = require('../utils/socket');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
    // ... (existing code)
    try {
        let query;
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string for search/filter using regex for loose matching
        let queryStr = JSON.stringify(reqQuery);
        // Basic filtering done, but for search we need more advanced logic

        let keyword = {};
        if (req.query.keyword) {
            keyword = {
                $or: [
                    { title: { $regex: req.query.keyword, $options: 'i' } },
                    { description: { $regex: req.query.keyword, $options: 'i' } },
                    { location: { $regex: req.query.keyword, $options: 'i' } }
                ]
            };
        }

        // Combine keyword search with other filters
        // Combine keyword search with other filters
        const finalQuery = { ...keyword, ...reqQuery };

        // Handle Array Filters (comma separated)
        if (req.query.jobType) {
            finalQuery.jobType = { $in: req.query.jobType.split(',') };
        }
        if (req.query.experience) {
            finalQuery.experienceLevel = { $in: req.query.experience.split(',') };
        }
        if (req.query.salary) {
            finalQuery.salary = { $gte: req.query.salary };
        }
        if (req.query.location) {
            finalQuery.location = { $regex: req.query.location, $options: 'i' };
        }

        if (req.query.keyword) delete finalQuery.keyword; // clean up

        query = Job.find(finalQuery).populate('employer', 'companyName companyDescription');

        // Execute query
        const jobs = await query;

        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get employer stats (jobs with applications)
// @route   GET /api/jobs/employer/stats
// @access  Private (Employer)
exports.getEmployerJobsStats = async (req, res, next) => {
    try {
        // Find jobs by this employer and populate applications
        const jobs = await Job.find({ employer: req.user.id })
            .populate({
                path: 'applications',
                select: 'status appliedAt' // We need status for stats
            })
            .sort('-createdAt');

        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: jobs,
            profileViews: user.profileViews || 0
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get external jobs from Jooble
// @route   POST /api/jobs/external
// @access  Public
exports.getJoobleJobs = async (req, res, next) => {
    try {
        const { keywords = 'it', location = 'India' } = req.body;
        const apiKey = process.env.JOOBLE_API_KEY;

        if (!apiKey || apiKey === 'YOUR_JOOBLE_API_KEY_HERE') {
            return res.status(503).json({ success: false, error: 'External job service not configured' });
        }

        const response = await axios.post(`https://jooble.org/api/${apiKey}`, {
            keywords,
            location
        });

        res.status(200).json({ success: true, count: response.data.jobs.length, data: response.data.jobs });
    } catch (err) {
        console.error('Jooble API Error:', err.message);
        res.status(502).json({ success: false, error: 'Failed to fetch external jobs' });
    }
};

// @desc    Get external jobs from TheirStack
// @route   POST /api/jobs/theirstack
// @access  Public
exports.getTheirStackJobs = async (req, res, next) => {
    try {
        const { keywords, location, limit = 10, page = 0 } = req.body;

        // This token should ideally be in .env but verifying user request directly first
        const token = process.env.THEIRSTACK_API_KEY;

        if (!token) {
            return res.status(503).json({ success: false, error: 'External job service not configured' });
        }

        const payload = {
            page: Number(page),
            limit: Number(limit),
            order_by: [{ desc: true, field: "date_posted" }],
            include_total_results: false,
            blur_company_data: false,
            // Search criteria
            job_title_or: keywords ? [keywords] : [],
            job_location_or: location ? [location] : [],
            job_country_code_or: ["IN"], // As per user request, can be made dynamic
            company_name_or: [],
            company_id_or: [],
            company_name_case_insensitive_or: [],
            company_domain_or: [],
            company_domain_not: [],
            company_name_not: [],
            company_name_partial_match_or: [],
            company_name_partial_match_not: [],
            company_description_pattern_or: [],
            company_description_pattern_not: [],
            min_employee_count: null,
            max_employee_count: null,
            min_employee_count_or_null: null,
            max_employee_count_or_null: null,
            min_funding_usd: null,
            max_funding_usd: null,
            funding_stage_or: [],
            industry_id_or: [],
            industry_id_not: [],
            company_tags_or: [],
            company_type: null,
            company_investors_or: [],
            company_investors_partial_match_or: [],
            company_technology_slug_or: [],
            company_technology_slug_and: [],
            company_technology_slug_not: [],
            company_location_pattern_or: [],
            company_list_id_or: [],
            company_list_id_not: [],
            job_id_or: [],
            job_title_not: [],
            job_title_pattern_and: [],
            job_title_pattern_or: [],
            job_title_pattern_not: [],
            job_country_code_not: [],
            posted_at_max_age_days: 15,
            posted_at_gte: null,
            posted_at_lte: null,
            discovered_at_max_age_days: null,
            discovered_at_min_age_days: null,
            discovered_at_gte: null,
            discovered_at_lte: null,
            company_country_code_or: [],
            company_country_code_not: [],
            job_description_contains_or: [],
            job_description_pattern_or: [],
            job_description_pattern_not: [],
            remote: null,
            reports_to_exists: null,
            final_url_exists: null,
            revealed_company_data: null,
            only_jobs_with_reports_to: null,
            only_jobs_with_hiring_managers: null,
            min_salary_usd: null,
            max_salary_usd: null,
            job_technology_slug_or: [],
            job_technology_slug_and: [],
            job_technology_slug_not: [],
            job_location_pattern_or: [],
            job_location_pattern_not: [],
            scraper_name_pattern_or: [],
            company_linkedin_url_exists: null,
            company_linkedin_url_or: [],
            url_domain_or: [],
            property_exists_or: [],
            min_revenue_usd: null,
            max_revenue_usd: null,
            employment_statuses_or: null,
            job_location_not: []
        };

        const response = await axios.post('https://api.theirstack.com/v1/jobs/search', payload, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Map TheirStack response to our format
        // TheirStack structure needs verification, assuming standard based on query
        // Usually returns { data: [...] }
        res.status(200).json({ success: true, count: response.data.data ? response.data.data.length : 0, data: response.data });
    } catch (err) {
        console.error('TheirStack API Error:', err.response ? err.response.data : err.message);
        res.status(500).json({ success: false, error: 'Failed to fetch jobs from TheirStack' });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id).populate('employer', 'companyName website email');

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employer)
exports.createJob = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.employer = req.user.id;

        if (req.user.role !== 'employer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'User is not authorized to add jobs' });
        }

        // Link company if provided
        if (req.body.companyId) {
            const company = await require('../models/Company').findById(req.body.companyId);
            if (!company) {
                return res.status(404).json({ success: false, error: 'Company not found' });
            }
            if (company.employer.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Not authorized to post jobs for this company' });
            }
            req.body.company = req.body.companyId;
        }

        const job = await Job.create(req.body);

        res.status(201).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer)
exports.updateJob = async (req, res, next) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Make sure user is job owner
        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'User is not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer)
exports.deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Make sure user is job owner
        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'User is not authorized to delete this job' });
        }

        await job.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Seeker)
exports.applyJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: req.params.id,
            applicant: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({ success: false, error: 'You have already applied to this job' });
        }

        // Check if user has a resume
        if (!req.user.resume) {
            return res.status(400).json({ success: false, error: 'Please upload a resume in your profile before applying' });
        }

        const application = await Application.create({
            job: req.params.id,
            applicant: req.user.id,
            resume: req.user.resume
        });

        // Real-time Notification to Employer
        try {
            const io = getIO();
            const notification = {
                type: 'new_application',
                title: 'New Application',
                message: `${req.user.name} applied for ${job.title}`,
                jobId: job._id,
                timestamp: new Date()
            };
            io.to(job.employer.toString()).emit('notification', notification);
        } catch (e) {
            console.error("Socket emit failed", e);
        }

        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get applications for a job
// @route   GET /api/jobs/:id/applications
// @access  Private (Employer)
exports.getJobApplications = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check ownership
        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const applications = await Application.find({ job: req.params.id }).populate('applicant', 'name email contact resume profilePhoto location headline skills gender');

        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all applications for the current employer (across all their jobs)
// @route   GET /api/jobs/employer/applications
// @access  Private (Employer)
exports.getEmployerApplications = async (req, res, next) => {
    try {
        // 1. Get all job IDs for this employer
        const jobs = await Job.find({ employer: req.user.id }).select('_id title');
        const jobIds = jobs.map(job => job._id);

        // 2. Find applications for these jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('applicant', 'name email contact resume profilePhoto location headline skills gender')
            .populate('job', 'title location')
            .sort('-appliedAt');

        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get jobs applied by current user (Seeker)
// @route   GET /api/jobs/applied
// @access  Private (Seeker)
exports.getAppliedJobs = async (req, res, next) => {
    try {
        const applications = await Application.find({ applicant: req.user.id }).populate({
            path: 'job',
            select: 'title location employer',
            populate: {
                path: 'employer',
                select: 'companyName'
            }
        });

        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Withdraw application
// @route   DELETE /api/jobs/application/:id
// @access  Private (Seeker)
exports.withdrawApplication = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        // Ensure user owns the application
        if (application.applicant.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to withdraw this application' });
        }

        await application.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Update application status
// @route   PUT /api/jobs/application/:id/status
// @access  Private (Employer)
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id)
            .populate('job', 'title employer')
            .populate('applicant', 'name');

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        // Check ownership (job employer must match current user)
        // application.job is populated, so application.job.employer is the ID
        if (application.job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this application' });
        }

        application.status = status;
        await application.save();

        // Create Notification for the Seeker
        await Notification.create({
            recipient: application.applicant._id, // The seeker
            sender: req.user.id, // The employer
            type: 'application_update',
            title: `Application ${status}`,
            message: `Your application for ${application.job.title} has been ${status.toLowerCase()}.`,
            meta: {
                jobId: application.job._id,
                applicationId: application._id
            }
        });

        // Real-time Notification to Seeker
        try {
            const io = getIO();
            io.to(application.applicant._id.toString()).emit('notification', {
                type: 'application_update',
                title: `Application ${status}`,
                message: `Your application for ${application.job.title} has been ${status.toLowerCase()}.`,
                timestamp: new Date()
            });
        } catch (e) {
            console.error("Socket emit failed", e);
        }

        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Duplicate a job
// @route   POST /api/jobs/:id/duplicate
// @access  Private (Employer)
exports.duplicateJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Check ownership
        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to duplicate this job' });
        }

        // Create new job object
        const newJobData = job.toObject();
        delete newJobData._id;
        delete newJobData.createdAt;
        delete newJobData.id;
        delete newJobData.__v;
        newJobData.title = `${newJobData.title} (Copy)`;
        newJobData.status = 'active'; // Reset status
        newJobData.applications = []; // Reset applications

        const newJob = await Job.create(newJobData);

        res.status(201).json({ success: true, data: newJob });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
