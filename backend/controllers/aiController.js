const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Get AI Fit Score for a candidate against a job
// @route   POST /api/ai/fit-score
// @access  Private (Employer)
exports.getFitScore = async (req, res) => {
    try {
        const { jobId, candidateId } = req.body;

        const job = await Job.findById(jobId);
        const candidate = await User.findById(candidateId);

        if (!job || !candidate) {
            return res.status(404).json({ success: false, error: 'Job or Candidate not found' });
        }

        // 1. Skill Matching
        const jobSkills = job.skills.map(s => s.toLowerCase().trim());
        const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase().trim());

        // Extract skills from comma separated string if it's not an array (handling legacy data)
        let normalizedCandidateSkills = [];
        if (Array.isArray(candidate.skills)) {
            normalizedCandidateSkills = candidate.skills.map(s => s.toLowerCase().trim());
        } else if (typeof candidate.skills === 'string') {
            normalizedCandidateSkills = candidate.skills.split(',').map(s => s.toLowerCase().trim());
        }

        // Calculate Intersection
        const matchedSkills = jobSkills.filter(skill => normalizedCandidateSkills.includes(skill));
        const missingSkills = jobSkills.filter(skill => !normalizedCandidateSkills.includes(skill));

        let score = 0;
        if (jobSkills.length > 0) {
            score = (matchedSkills.length / jobSkills.length) * 100;
        } else {
            // If job has no explicit skills, look for keywords in description
            const descriptionWords = job.description.toLowerCase().split(/\W+/);
            const matches = normalizedCandidateSkills.filter(skill => descriptionWords.includes(skill));
            score = Math.min((matches.length * 10), 80); // Cap at 80 for description only matches
        }

        // 2. Title/Headline Match Bonus
        if (candidate.headline) {
            const titleWords = job.title.toLowerCase().split(' ');
            const headlineWords = candidate.headline.toLowerCase().split(' ');
            const titleMatch = titleWords.some(word => headlineWords.includes(word));
            if (titleMatch) score += 10;
        }

        // Cap at 100
        score = Math.min(Math.round(score), 100);

        // Analysis Text
        let analysis = "";
        if (score >= 80) analysis = "Excellent Match! The candidate possesses most of the required skills.";
        else if (score >= 50) analysis = "Good Potential. Candidate matches core skills but may need upskilling.";
        else analysis = "Low Compatibility. Significant skill gaps identified.";

        res.status(200).json({
            success: true,
            data: {
                score,
                matchedSkills,
                missingSkills,
                analysis
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Generate Job Description (Mock AI)
// @route   POST /api/ai/generate-description
// @access  Private (Employer)
exports.generateJobDescription = async (req, res) => {
    try {
        const { title, keywords } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Job title is required' });
        }

        // Simple Template System
        let template = {
            description: "",
            responsibilities: "",
            qualifications: ""
        };

        const t = title.toLowerCase();

        if (t.includes('developer') || t.includes('software') || t.includes('engineer')) {
            template.description = `We are looking for a skilled ${title} to join our dynamic team. You will be responsible for developing high-quality software solutions and collaborating with cross-functional teams to deliver exceptional user experiences.`;
            template.responsibilities = `- Design and build efficient, reusable, and reliable code.\n- Ensure the best possible performance, quality, and responsiveness of applications.\n- Identify bottlenecks and bugs, and devise solutions to these problems.`;
            template.qualifications = `- Bachelor's degree in Computer Science or related field.\n- Proven experience with ${keywords || 'modern web technologies'}.\n- Strong problem-solving skills and attention to detail.`;
        } else if (t.includes('manager') || t.includes('lead')) {
            template.description = `We are seeking an experienced ${title} to lead our team. You will drive strategy, mentor team members, and ensure the successful delivery of projects.`;
            template.responsibilities = `- Lead and manage the daily operations of the team.\n- Develop and implement strategies to improve performance and efficiency.\n- Mentor and coach team members to foster professional growth.`;
            template.qualifications = `- Proven leadership experience in a similar role.\n- Excellent communication and organizational skills.\n- Experience with ${keywords || 'project management tools'}.`;
        } else if (t.includes('designer') || t.includes('ui') || t.includes('ux')) {
            template.description = `We are looking for a creative ${title} to design beautiful and intuitive user interfaces. You will work closely with product managers and developers to bring ideas to life.`;
            template.responsibilities = `- Create wireframes, storyboards, user flows, process flows, and site maps.\n- Design and prototype UI elements and interactions.\n- Conduct user research and testing to iterate on designs.`;
            template.qualifications = `- Portfolio demonstrating strong design skills.\n- Proficiency in design tools like Figma, Sketch, or Adobe XD.\n- Understanding of user-centered design principles.`;
        } else {
            // Generic Fallback
            template.description = `We are hiring a ${title} to support our growing operations. The ideal candidate will be motivated, detail-oriented, and ready to take on new challenges.`;
            template.responsibilities = `- Perform duties related to ${title} effectively and efficiently.\n- Collaborate with team members to achieve common goals.\n- Maintain accurate records and prepare reports as needed.`;
            template.qualifications = `- Relevant experience in a similar position.\n- Strong communication skills.\n- Ability to work independently and as part of a team.`;
        }

        res.status(200).json({
            success: true,
            data: template
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
