const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadStudents, getStudents, createStudent, deleteStudent, downloadTemplate } = require('../controllers/studentController');

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    }
});

router.post('/upload', protect, upload.single('file'), uploadStudents);
router.post('/create', protect, createStudent);
router.get('/', protect, getStudents);
router.get('/template', protect, downloadTemplate);
router.delete('/:id', protect, deleteStudent);


module.exports = router;
