const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateCertificate, searchCertificate, downloadCertificate } = require('../controllers/certController');

router.post('/generate/:id', protect, generateCertificate);
router.get('/search/:id', searchCertificate);
router.get('/download/:id', downloadCertificate);

module.exports = router;
