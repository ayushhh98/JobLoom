const express = require('express');
const { getFitScore, generateJobDescription } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/fit-score', protect, getFitScore);
router.post('/generate-description', protect, generateJobDescription);

module.exports = router;
