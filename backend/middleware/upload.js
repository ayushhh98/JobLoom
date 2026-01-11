
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional, but good practice)
const fileFilter = (req, file, cb) => {
    const mime = file.mimetype.toLowerCase();
    const ext = path.extname(file.originalname).toLowerCase();

    console.log(`[Upload Check] Processing ${file.originalname} (${mime})`);

    const allowedMimes = [
        'image', 'pdf', 'msword', 'word', 'document', 'officedocument'
    ];

    // Check if mimetype contains any of the allowed keywords OR is generic binary
    const isMimeValid = allowedMimes.some(type => mime.includes(type)) || mime.includes('octet-stream');

    // Explicit extension check
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    const isExtValid = allowedExts.includes(ext);

    // If extension is valid, we're generally good to go for this use case
    if (isExtValid) {
        return cb(null, true);
    }

    console.error(`[Upload Check] Rejected: ${file.originalname} (Mime: ${mime}, Ext: ${ext})`);
    cb(new Error(`Invalid file type. Mime: ${mime}, Ext: ${ext}`));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
