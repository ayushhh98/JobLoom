const express = require('express');
const {
    getJobs, getJob, createJob, updateJob, deleteJob,
    applyJob, getJobApplications, getAppliedJobs,
    getJoobleJobs, getTheirStackJobs, withdrawApplication,
    getEmployerJobsStats, getEmployerApplications, updateApplicationStatus,
    duplicateJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/employer/stats', protect, authorize('employer', 'admin'), getEmployerJobsStats);
router.get('/employer/applications', protect, authorize('employer', 'admin'), getEmployerApplications);

router.route('/')
    .get(getJobs)
    .post(protect, authorize('employer', 'admin'), createJob);

router.post('/external', getJoobleJobs);
router.post('/external/theirstack', getTheirStackJobs);

router.get('/applied', protect, authorize('seeker'), getAppliedJobs);


router.route('/:id')
    .get(getJob)
    .put(protect, authorize('employer', 'admin'), updateJob)
    .delete(protect, authorize('employer', 'admin'), deleteJob);

router.route('/:id/apply').post(protect, authorize('seeker'), applyJob);
router.route('/:id/applications').get(protect, authorize('employer', 'admin'), getJobApplications);
router.post('/:id/duplicate', protect, authorize('employer', 'admin'), duplicateJob);
router.put('/application/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);
router.delete('/application/:id', protect, authorize('seeker'), withdrawApplication);

module.exports = router;
