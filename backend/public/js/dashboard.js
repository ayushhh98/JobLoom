// slider logic
function initSlider() {
    const container = document.querySelector('.slides-container');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (!container || slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let slideInterval;

    function showSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        currentSlide = index;
        const offset = -currentSlide * 100;
        container.style.transform = `translateX(${offset}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
            if (i === currentSlide) {
                dot.style.background = 'var(--primary)';
                dot.style.opacity = '1';
            } else {
                dot.style.background = 'var(--gray)';
                dot.style.opacity = '0.5';
            }
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Event Listeners
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.slide);
            showSlide(index);
            resetTimer();
        });
    });

    function startTimer() {
        slideInterval = setInterval(nextSlide, 5000); // 5 seconds
    }

    function resetTimer() {
        clearInterval(slideInterval);
        startTimer();
    }

    // Initialize
    startTimer();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Init Slider
    initSlider();



    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.success) {
            const user = data.data;
            window.currentUser = user;

            // Update welcome name if exists
            const welcomeName = document.getElementById('welcomeName');
            if (welcomeName) {
                welcomeName.textContent = user.name;
            }
            const displayName = document.getElementById('displayName');
            if (displayName) {
                displayName.textContent = user.name;
            }

            // Determine dashboard type based on user role or page elements
            const appliedJobsList = document.getElementById('appliedJobsList');
            const postedJobsList = document.getElementById('postedJobsList');

            if (user.role === 'seeker' || appliedJobsList) {
                // Seeker Dashboard Logic
                await loadAppliedJobs();
            } else if (user.role === 'employer' || postedJobsList) {
                // Employer Dashboard Logic
                await loadPostedJobs(postedJobsList);
            }

        } else {
            // Not authenticated or error
            window.location.href = '/login';
        }
    } catch (err) {
        console.error('Auth check failed', err);
        window.location.href = '/login';
    }
});

// Global showTab function for tab switching (if used)
window.showTab = function (tabId) {
    const tabs = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => tab.style.display = 'none');

    const selectedTab = document.getElementById('tab-' + tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }

    // Update nav state in dashboard-employer
    const navTabs = document.querySelectorAll('.nav-tab');
    if (navTabs.length > 0) {
        navTabs.forEach(el => {
            el.classList.remove('active');
            el.style.color = 'var(--gray)';
            el.style.fontWeight = '500';
        });
        const activeLink = document.querySelector(`a[href="#${tabId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.style.color = 'var(--dark)';
            activeLink.style.fontWeight = '600';
        }
    }
};


async function loadPostedJobs(list) {
    if (!list) return;

    list.innerHTML = '<p style="color: var(--gray);">Loading jobs...</p>';

    try {
        const res = await fetch('/api/jobs');
        const data = await res.json();

        if (data.success) {
            // Filter jobs for current employer
            const myJobs = data.data.filter(job =>
                (job.employer._id === window.currentUser._id) ||
                (job.employer === window.currentUser._id)
            );

            // Update Stats
            updateEmployerStats(myJobs);

            if (myJobs.length === 0) {
                list.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-clipboard-list" style="font-size: 2rem; color: var(--secondary); opacity: 0.5; margin-bottom: 1rem;"></i>
                    <p style="color: var(--gray);">You haven't posted any jobs yet.</p>
                    <a href="/post-job" class="btn btn-primary" style="margin-top: 1rem;">Post Your First Job</a>
                </div>`;
                return;
            }

            list.innerHTML = '';
            myJobs.forEach(job => {
                const div = document.createElement('div');
                div.className = 'glass-card';
                div.style.marginBottom = '1rem';
                div.style.padding = '1.5rem';
                div.style.borderLeft = '4px solid var(--primary)';
                div.style.transition = 'transform 0.2s ease';

                // Job Card HTML
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h5 style="margin-bottom:0.5rem; font-size:1.2rem; font-weight: 700;">${job.title}</h5>
                             <div style="display: flex; gap: 1rem; color: var(--gray); font-size: 0.9rem; margin-bottom: 0.5rem;">
                                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                                <span><i class="fas fa-dollar-sign"></i> ${job.salary || 'Not specified'}</span>
                                <span><i class="fas fa-clock"></i> ${new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                <span style="background: #e0e7ff; color: var(--primary); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500;">Active</span>
                                <span style="background: #f3f4f6; color: var(--gray); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">${job.jobType || 'Full Time'}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                             <button onclick="viewApplicants('${job._id}', '${job.title}')" class="btn btn-outline" style="font-size:0.9rem; padding:0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-users"></i> Applicants
                             </button>
                             <button class="btn btn-primary" style="font-size:0.9rem; padding:0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-pen"></i> Edit
                             </button>
                        </div>
                    </div>
                `;
                list.appendChild(div);
            });
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p style="color: red;">Failed to load jobs.</p>';
    }
}

function updateEmployerStats(jobs) {
    const activeStat = document.getElementById('statActiveJobs');
    if (activeStat) activeStat.textContent = jobs.length;

    // Mock stats for demo purposes or calculating if possible
    const applicantStat = document.getElementById('statTotalApplicants');
    if (applicantStat) {
        // Random number for demo feeling or 0
        // Real implementation would need to fetch all applications
        applicantStat.textContent = Math.floor(jobs.length * Math.random() * 5);
    }

    const viewsStat = document.getElementById('statViews');
    if (viewsStat) viewsStat.textContent = Math.floor(Math.random() * 100) + 20;

    const shortStat = document.getElementById('statShortlisted');
    if (shortStat) shortStat.textContent = Math.floor(Math.random() * 10);

    const interviewStat = document.getElementById('statInterviews');
    if (interviewStat) interviewStat.textContent = Math.floor(Math.random() * 5);

    const msgStat = document.getElementById('statMessages');
    if (msgStat) msgStat.textContent = Math.floor(Math.random() * 8);
}

async function viewApplicants(jobId, jobTitle) {
    // Switch to applicants tab
    if (window.showTab) window.showTab('applicants');

    const list = document.getElementById('recentApplicantsList');
    if (!list) return;

    list.innerHTML = '<p style="color: var(--gray); text-align: center;">Loading applicants for <strong>' + jobTitle + '</strong>...</p>';

    try {
        const res = await fetch(`/api/jobs/${jobId}/applications`);
        const data = await res.json();

        if (data.success) {
            if (data.count === 0) {
                list.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-user-friends" style="font-size: 2rem; color: var(--gray); opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p>No applicants for <strong>${jobTitle}</strong> yet.</p>
                    </div>
                `;
            } else {
                list.innerHTML = `<h5 style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #eee;">Applicants for: <span style="color: var(--primary);">${jobTitle}</span></h5>`;

                // Create table or detailed list
                const table = document.createElement('div');
                table.style.display = 'grid';
                table.style.gap = '1rem';

                data.data.forEach(app => {
                    const card = document.createElement('div');
                    card.className = 'glass-card';
                    card.style.padding = '1rem';
                    card.style.display = 'flex';
                    card.style.justifyContent = 'space-between';
                    card.style.alignItems = 'center';

                    card.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 40px; height: 40px; background: #e0e7ff; color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                ${app.applicant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h6 style="font-size: 1rem; margin-bottom: 0.2rem;">${app.applicant.name}</h6>
                                <p style="font-size: 0.85rem; color: var(--gray);">${app.applicant.email}</p>
                            </div>
                        </div>
                        <div style="text-align: right;">
                             <p style="font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem;">Applied: ${new Date(app.appliedAt || Date.now()).toLocaleDateString()}</p>
                             <div style="display: flex; gap: 0.5rem;">
                                <a href="${app.resume}" target="_blank" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.3rem 0.8rem;">Resume</a>
                                <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.3rem 0.8rem;">Shortlist</button>
                             </div>
                        </div>
                    `;
                    table.appendChild(card);
                });
                list.appendChild(table);
            }
        } else {
            list.innerHTML = '<p style="color: red;">Error fetching applicants</p>';
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p style="color: red;">Failed to load data.</p>';
    }
}
// Make viewApplicants global
window.viewApplicants = viewApplicants;


async function loadAppliedJobs() {
    const list = document.getElementById('appliedJobsList');
    if (!list) return;

    try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/jobs/applied', { headers });
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            const applications = data.data;

            // Update Stats (if elements exist)
            if (document.getElementById('statApplied')) document.getElementById('statApplied').textContent = applications.length;

            if (applications.length === 0) {
                list.innerHTML = `
                    <div class="glass-card" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-folder-open" style="font-size: 2rem; color: var(--gray); opacity: 0.5; margin-bottom: 1rem;"></i>
                        <p style="color: var(--gray);">You haven't applied to any jobs yet.</p>
                        <a href="/jobs" class="btn btn-primary" style="margin-top: 1rem;">Browse Jobs</a>
                    </div>
                 `;
                return;
            }

            // Show latest 3 applications
            list.innerHTML = '';
            applications.slice(0, 3).forEach(app => {
                let statusColor = '#3b82f6';
                let statusBg = '#eff6ff';
                const status = app.status || 'Applied';

                if (status === 'reviewed') { statusColor = '#22c55e'; statusBg = '#f0fdf4'; }
                if (status === 'interview') { statusColor = '#8b5cf6'; statusBg = '#f5f3ff'; }
                if (status === 'rejected') { statusColor = '#ef4444'; statusBg = '#fef2f2'; }

                const jobTitle = app.job ? app.job.title : 'Unknown Job';
                const companyName = (app.job && app.job.employer) ? app.job.employer.companyName : 'Unknown Company';
                const location = app.job ? app.job.location : '';

                const div = document.createElement('div');
                div.className = 'glass-card';
                div.style.padding = '1.25rem';
                div.style.borderLeft = '4px solid var(--primary)';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                div.style.marginBottom = '1rem';

                div.innerHTML = `
                    <div style="display:flex; align-items:center; gap:1rem;">
                         <div style="width:40px; height:40px; background:#e0e7ff; color:var(--primary); border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                            ${companyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 style="margin:0; font-size:1rem;">${jobTitle}</h4>
                            <p style="color:var(--gray); font-size:0.85rem; margin:0;">${companyName} • ${location}</p>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <span style="display:inline-block; padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; background: ${statusBg}; color: ${statusColor}; margin-bottom:0.5rem;">
                            ${status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        <br>
                        <a href="/applications" class="btn-link" style="font-size:0.8rem;">View Details</a>
                    </div>
                 `;
                list.appendChild(div);
            });
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p style="color: red; text-align:center;">Failed to load applications.</p>';
    }
}
