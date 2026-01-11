document.addEventListener('DOMContentLoaded', () => {

    const jobList = document.getElementById('jobList');
    if (jobList) {
        fetchJobs(); // Initial load

        const searchForm = document.getElementById('searchForm');
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const keyword = document.getElementById('keyword').value;
            const location = document.getElementById('location').value;
            fetchJobs(keyword, null, location);
        });

        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                const keyword = document.getElementById('keyword').value;
                const location = document.getElementById('location').value;

                // Collect Checked Job Types
                const jobTypes = Array.from(document.querySelectorAll('input[name="jobType"]:checked')).map(cb => cb.value);

                // Collect Checked Experience
                const experience = Array.from(document.querySelectorAll('input[name="experience"]:checked')).map(cb => cb.value);

                // Collect Salary
                const salary = document.getElementById('salaryRange').value;

                fetchJobs(keyword, jobTypes, location, experience, salary);
            });
        }
    }

    async function fetchJobs(keyword = '', jobTypes = [], location = '', experience = [], salary = 0) {
        const loadingDiv = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--gray); padding: 3rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
                <p style="margin-top: 1rem;">Loading jobs...</p>
            </div>
        `;
        if (jobList) jobList.innerHTML = loadingDiv;

        try {
            // 1. Fetch Local Jobs
            // 1. Fetch Local Jobs
            let localUrl = '/api/jobs?';
            if (keyword) localUrl += `keyword=${encodeURIComponent(keyword)}&`;
            if (location) localUrl += `location=${encodeURIComponent(location)}&`;
            if (jobTypes && jobTypes.length > 0) localUrl += `jobType=${encodeURIComponent(jobTypes.join(','))}&`;
            if (experience && experience.length > 0) localUrl += `experience=${encodeURIComponent(experience.join(','))}&`;
            if (salary > 0) localUrl += `salary=${encodeURIComponent(salary)}&`;

            const localReq = fetch(localUrl).then(res => res.json());

            // 2. Fetch External Jobs (Jooble)
            // Use POST endpoint, default to 'India' if no location logic yet
            const externalReq = fetch('/api/jobs/external', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywords: keyword || 'it', location: 'India' })
            }).then(res => res.json());

            const [localRes, externalRes] = await Promise.all([localReq, externalReq]);

            let allJobs = [];

            // Process Local
            if (localRes.success) {
                allJobs = allJobs.concat(localRes.data.map(job => ({ ...job, isExternal: false })));
            }

            // Process External
            if (externalRes.success && Array.isArray(externalRes.data)) {
                const externalJobs = externalRes.data.map(job => ({
                    _id: job.id, // Jooble uses 'id'
                    title: job.title,
                    employer: { companyName: job.company },
                    location: job.location,
                    salaryRange: job.salary || 'Not disclosed',
                    jobType: 'External', // Jooble often doesn't give type in summary
                    isExternal: true,
                    link: job.link,
                    snippet: job.snippet
                }));
                allJobs = allJobs.concat(externalJobs);
            }

            renderJobs(allJobs);

            if (document.getElementById('resultsCount')) {
                document.getElementById('resultsCount').textContent = `Showing ${allJobs.length} Results`;
            }

        } catch (err) {
            console.error(err);
            if (jobList) jobList.innerHTML = '<p style="text-align:center; color:red;">Failed to load jobs.</p>';
        }
    }

    function renderJobs(jobs) {
        if (!jobList) return;
        jobList.innerHTML = '';

        if (jobs.length === 0) {
            jobList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1.5rem;"></i>
                    <h3 style="color: var(--gray);">No jobs found</h3>
                    <p style="color:#94a3b8;">Try adjusting your search filters.</p>
                </div>
            `;
            return;
        }

        jobs.forEach(job => {
            // Generate visual assets (random for demo)
            const companyInitial = job.employer && job.employer.companyName ? job.employer.companyName[0].toUpperCase() : 'H';
            const colors = ['#4F46E5', '#06b6d4', '#ea580c', '#16a34a', '#db2777', '#7c3aed'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            // External Badge
            let badge = '';
            if (job.isExternal) {
                badge = '<span class="badge badge-new" style="background:#f59e0b;">Jooble</span>';
            } else {
                const isNew = Math.random() > 0.7;
                badge = isNew ? '<span class="badge badge-new">New</span>' : '';
            }

            const card = document.createElement('div');
            card.className = 'job-card-enhanced';
            card.innerHTML = `
                <div style="display: flex; align-items: start; margin-bottom: 1.5rem;">
                    <div class="company-logo-placeholder" style="background: ${randomColor};">
                        ${companyInitial}
                    </div>
                    <div style="flex-grow: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <h3 style="font-size: 1.25rem; margin-bottom: 0.25rem; line-height: 1.4;">${job.title}</h3>
                             ${badge}
                        </div>
                        <p style="color: var(--gray); font-size: 0.95rem; font-weight: 500;">${job.employer ? job.employer.companyName : 'Confidential Company'}</p>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                    <span style="background: #f1f5f9; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.85rem; color: #475569;"><i class="fas fa-briefcase" style="color: #94a3b8; margin-right: 0.25rem;"></i> ${job.jobType}</span>
                    <span style="background: #f1f5f9; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.85rem; color: #475569;"><i class="fas fa-map-marker-alt" style="color: #94a3b8; margin-right: 0.25rem;"></i> ${job.location}</span>
                </div>

                <div class="card-footer">
                   <div>
                        <span style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.2rem;">Salary Range</span>
                        <span style="font-weight: 700; color: var(--dark);">${job.salaryRange}</span>
                   </div>
                   ${job.isExternal
                    ? `<a href="${job.link}" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.9rem; background: var(--secondary); border-color: var(--secondary);">Apply on Jooble <i class="fas fa-external-link-alt" style="font-size:0.8rem; margin-left:0.3rem;"></i></a>`
                    : `<a href="#" onclick="viewJob('${job._id}')" class="btn btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.9rem;">View Details</a>`
                }
                </div>
            `;
            jobList.appendChild(card);
        });
    }

    window.viewJob = (id) => {
        window.location.href = '/job-details?id=' + id;
    };
});
