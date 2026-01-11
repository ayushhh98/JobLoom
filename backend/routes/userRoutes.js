const express = require('express');
const { updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.put('/profile', protect, upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'profilePhoto', maxCount: 1 }]), updateProfile);

module.exports = router;
