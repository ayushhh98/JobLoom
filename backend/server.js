const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');

const certRoutes = require('./routes/certRoutes');
const studentRoutes = require('./routes/studentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity in this project (images/scripts)
}));
app.use(morgan('dev'));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/cert', certRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/companies', require('./routes/companies'));

// Routes (Views)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'register.html')));
app.get('/dashboard-seeker', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'dashboard-seeker.html')));
app.get('/dashboard-employer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'dashboard-employer.html')));
app.get('/jobs', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'jobs.html')));
app.get('/post-job', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'post-job.html')));
app.get('/job-details', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'job-details.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'admin-dashboard.html')));

app.get('/certificate-management', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'certificate-management.html')));
app.get('/applications', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'applications.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'profile.html')));
app.get('/recruiter-register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'recruiter-register.html')));
app.get('/recruiter-success', (req, res) => res.sendFile(path.join(__dirname, 'public', 'views', 'recruiter-success.html')));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Resource not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Initialize Socket.io
const io = require('./utils/socket').init(server);
