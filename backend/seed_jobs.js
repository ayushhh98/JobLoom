const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');
const User = require('./models/User');

dotenv.config();

const seedJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find an employer
        let employer = await User.findOne({ role: 'employer' });
        if (!employer) {
            console.log('No employer found. Creating one...');
            employer = await User.create({
                name: 'Tech Corp',
                email: 'employer@example.com',
                password: 'password123',
                role: 'employer',
                companyName: 'Tech Corp Inc.',
                companyDescription: 'Leading tech company.'
            });
        }

        const jobs = [
            {
                title: 'Software Engineer',
                description: 'We are looking for a skilled Software Engineer with React and Node.js experience.',
                jobType: 'Full-time',
                salaryRange: '$80k - $120k',
                location: 'Remote',
                qualifications: 'BS in CS, 3+ years experience',
                responsibilities: 'Develop features, fix bugs',
                employer: employer._id
            },
            {
                title: 'Product Manager',
                description: 'Experienced PM needed to lead our new product line.',
                jobType: 'Full-time',
                salaryRange: '$100k - $140k',
                location: 'New York, NY',
                qualifications: '5+ years experience, MBA preferred',
                responsibilities: 'Roadmap planning, stakeholder management',
                employer: employer._id
            },
            {
                title: 'Data Analyst Intern',
                description: 'Join our data team for a summer internship.',
                jobType: 'Internship',
                salaryRange: '$20/hr',
                location: 'San Francisco, CA',
                qualifications: 'Current student in Data Science or related field',
                responsibilities: 'Analyze datasets, create reports',
                employer: employer._id
            }
        ];

        await Job.insertMany(jobs);
        console.log('Jobs Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedJobs();
