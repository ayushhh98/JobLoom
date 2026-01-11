const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Overview
        const jobs = await Job.find({ employer: userId }).select('_id title status');
        const totalJobs = jobs.length;
        const jobIds = jobs.map(j => j._id);

        const applications = await Application.find({ job: { $in: jobIds } }).populate('job', 'title');
        const totalApplications = applications.length;
        const hiredCount = applications.filter(a => a.status === 'Accepted').length;

        // 2. Trends (Last 6 Months)
        const months = {};
        const now = new Date();
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = { name: key, applications: 0, hired: 0 };
        }

        // Aggregate
        applications.forEach(app => {
            const date = new Date(app.appliedAt);
            // Only count if within last ~6 months range roughly (or just match key)
            const key = date.toLocaleString('default', { month: 'short' });
            // Simple check: if key exists in our window
            if (months[key]) {
                months[key].applications++;
                if (app.status === 'Accepted') months[key].hired++;
            }
        });
        const trends = Object.values(months);

        // 3. Status Distribution
        const statusMap = { 'Pending': 0, 'Reviewed': 0, 'Interviewing': 0, 'Accepted': 0, 'Rejected': 0 };
        applications.forEach(app => {
            // Normalize status if inconsistent
            let s = app.status;
            if (s === 'Interview') s = 'Interviewing';
            if (statusMap[s] !== undefined) {
                statusMap[s]++;
            } else {
                // fallback or ignore
                // statusMap['Other'] = (statusMap['Other'] || 0) + 1;
            }
        });
        // Filter out zero values if desired, or keep to show 0
        const statusDistribution = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

        // 4. Job Performance (Top 5)
        const jobPerfMap = {};
        applications.forEach(app => {
            const title = app.job?.title || 'Unknown Job';
            if (!jobPerfMap[title]) jobPerfMap[title] = 0;
            jobPerfMap[title]++;
        });
        const jobPerformance = Object.entries(jobPerfMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                overview: { totalJobs, totalApplications, hiredCount },
                trends,
                statusDistribution,
                jobPerformance
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
