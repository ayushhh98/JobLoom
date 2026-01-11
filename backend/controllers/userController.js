const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const fs = require('fs');
const path = require('path');

exports.updateProfile = async (req, res, next) => {
    try {
        console.log('Update Profile Body:', req.body); // Log incoming data

        const fieldsToUpdate = {};

        // Helper to set if defined
        const setIfDefined = (key, value) => {
            if (value !== undefined && value !== 'undefined' && value !== null && value !== 'null') {
                fieldsToUpdate[key] = value;
            }
        };

        setIfDefined('name', req.body.name);
        setIfDefined('email', req.body.email);
        setIfDefined('contact', req.body.contact);
        setIfDefined('companyName', req.body.companyName);
        setIfDefined('companyDescription', req.body.companyDescription);
        setIfDefined('gender', req.body.gender);
        setIfDefined('location', req.body.location);
        setIfDefined('headline', req.body.headline);
        setIfDefined('address', req.body.address);

        // Handle Skills
        if (req.body.skills) {
            if (Array.isArray(req.body.skills)) {
                fieldsToUpdate.skills = req.body.skills;
            } else if (typeof req.body.skills === 'string') {
                fieldsToUpdate.skills = req.body.skills.split(',').map(s => s.trim()).filter(s => s);
            }
        }

        // Handle Nested Objects (Education) - Use Dot Notation for partial updates or construct full object if replacing
        // Strategy: We want to update individual fields if provided.
        // But since we are likely sending all fields from frontend form, replacing the object is okay IF we handle undefineds.
        // However, a cleaner Mongoose way for partials is dot notation, but here we'll just build the object sparsely.

        // Education
        if (req.body.tenth || req.body.twelfth || req.body.sgpa) {
            fieldsToUpdate.education = {
                tenth: req.body.tenth || undefined,
                twelfth: req.body.twelfth || undefined,
                sgpa: req.body.sgpa || undefined
            };
            // Clean up undefined props from this object so we don't accidentally unset them if we wanted to keep them? 
            // Actually, simplest is: if we receive ANY education data, we assume the form sent the complete current state of education.
            // If the form sends partial data, we might lose data. 
            // But Profile.jsx sends ALL fields. So it's safe to reconstruct the object.
            Object.keys(fieldsToUpdate.education).forEach(key => fieldsToUpdate.education[key] === undefined && delete fieldsToUpdate.education[key]);
        }

        if (req.body.github || req.body.linkedin || req.body.portfolio) {
            fieldsToUpdate.social = {
                github: req.body.github || undefined,
                linkedin: req.body.linkedin || undefined,
                portfolio: req.body.portfolio || undefined
            };
            Object.keys(fieldsToUpdate.social).forEach(key => fieldsToUpdate.social[key] === undefined && delete fieldsToUpdate.social[key]);
        }

        setIfDefined('about', req.body.about);

        // Stats
        if (req.body.projects || req.body.happyClients || req.body.yearsExperience || req.body.awards) {
            fieldsToUpdate.stats = {
                projects: req.body.projects || undefined,
                happyClients: req.body.happyClients || undefined,
                yearsExperience: req.body.yearsExperience || undefined,
                awards: req.body.awards || undefined
            };
            Object.keys(fieldsToUpdate.stats).forEach(key => fieldsToUpdate.stats[key] === undefined && delete fieldsToUpdate.stats[key]);
        }

        if (req.files) {
            if (req.files.resume) {
                fieldsToUpdate.resume = '/uploads/' + req.files.resume[0].filename;
            }
            if (req.files.profilePhoto) {
                fieldsToUpdate.profilePhoto = '/uploads/' + req.files.profilePhoto[0].filename;
            }
        }

        const user = await User.findByIdAndUpdate(req.user.id, { $set: fieldsToUpdate }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error("Update Profile Error:", err);
        // Log to file
        fs.appendFileSync(path.join(__dirname, '../error_log.txt'), `${new Date().toISOString()} - Update Profile Error: ${err.message}\n${err.stack}\n\n`);

        res.status(400).json({ success: false, error: err.message });
    }
};
