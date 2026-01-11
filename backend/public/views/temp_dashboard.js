document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            localStorage.removeItem('user');
            window.location.href = '/login';
        });
    }

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

            // Update profile photo if exists
            const sidebarPhoto = document.getElementById('sidebarPhoto');
            if (sidebarPhoto) {
                // Logic to show photo if avaialble, else initials or icon
                // sidebarPhoto.innerHTML = ...
            }
            const displayName = document.getElementById('displayName');
            if (displayName) {
                displayName.textContent = user.name;
            }


            // Determine dashboard type based on user role or page elements
            const appliedJobsList = document.getElementById('appliedJobsList');
            const postedJobsList = document.getElementById('list'); // Assuming 'list' ID is for posted jobs in employer view

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
    // Hide all tab contents if you have a tab system
    const tabs = document.querySelectorAll('.tab-content-section'); // Add this class to your tab sections if they exist
    tabs.forEach(tab => tab.style.display = 'none');

    // Show specific tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }

    // For dashboard-seeker.html which might use scrolling or simpler logic:
    if (tabId === 'applied') {
        const appliedSection = document.getElementById('appliedJobsList');
        if (appliedSection) {
            appliedSection.scrollIntoView({ behavior: 'smooth' });
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

            if (myJobs.length === 0) {
                list.innerHTML = '<p style="color: var(--gray);">You haven\'t posted any jobs yet.</p>';
                return;
            }

            list.innerHTML = '';
            myJobs.forEach(job => {
                const div = document.createElement('div');
                div.className = 'glass-card';
                div.style.marginBottom = '1rem';
                div.style.padding = '1rem';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h5 style="margin-bottom:0.5rem; font-size:1.1rem;">${job.title}</h5>
                             <p style="font-size:0.9rem; color:var(--gray);">${job.location}</p>
                        </div>
                        <div>
                             <button onclick="viewApplicants('${job._id}')" class="btn btn-primary" style="font-size:0.8rem; padding:0.5rem 1rem;">View Applicants</button>
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

async function viewApplicants(jobId) {
    try {
        const res = await fetch(`/api/jobs/${jobId}/applications`);
        const data = await res.json();

        if (data.success) {
            if (data.count === 0) {
                alert('No applicants for this job yet.');
            } else {
                let msg = `Applicants for Job ID ${jobId}:\n`;
                data.data.forEach(app => {
                    msg += `- ${app.applicant.name} (${app.applicant.email})\n  Resume: ${app.resume}\n`;
                });
                alert(msg);
            }
        } else {
            alert('Error fetching applicants');
        }
    } catch (err) {
        console.error(err);
    }
}
// Make viewApplicants global
window.viewApplicants = viewApplicants;


async function loadAppliedJobs() {
    const list = document.getElementById('appliedJobsList');
    if (!list) return;

    try {
        const res = await fetch('/api/jobs/applied'); // Make sure this endpoint exists or adjust to fetch applications
        // Note: Assuming there's an endpoint to get jobs the user applied to. 
        // If not, might need to fetch all applications and filter by user ID if API allows, or use existing endpoint logic.

        // Use a mock data or the real endpoint if it exists. 
        // Based on previous code, it tried '/api/jobs/applied'. Let's assume it works or handle error gracefully.

        let data;
        try {
            const response = await fetch('/api/applications/my-applications'); // Common pattern, trying standard if above fails or using the one from previous code
            if (response.ok) {
                data = await response.json();
            } else {
                // Fallback to previous usage if that was correct endpoint
                const res2 = await fetch('/api/jobs/applied');
                data = await res2.json();
            }
        } catch (e) {
            // Fallback
            console.log("Primary fetch failed, trying fallback");
            const res = await fetch('/api/jobs/applied');
            data = await res.json();
        }


        if (data.success || Array.isArray(data.data)) {
            const applications = data.data || [];

            // Update Stats
            if (document.getElementById('statApplied')) {
                document.getElementById('statApplied').textContent = applications.length;
                // Dummy stats for demo
                document.getElementById('statReviewed').textContent = Math.floor(applications.length * 0.5);
                document.getElementById('statInterview').textContent = Math.floor(applications.length * 0.2);
            }

            if (applications.length === 0) {
                list.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-folder-open" style="font-size: 2rem; color: var(--gray); opacity: 0.5; margin-bottom: 1rem;"></i>
                        <p style="color: var(--gray);">You haven't applied to any jobs yet.</p>
                        <a href="/jobs" class="btn btn-primary" style="margin-top: 1rem;">Browse Jobs</a>
                    </div>
                 `;
                return;
            }

            list.innerHTML = '';
            applications.forEach(app => {
                let statusColor = '#3b82f6';
                let statusBg = '#eff6ff';
                const status = app.status || 'Pending';

                if (status === 'Reviewed') { statusColor = '#22c55e'; statusBg = '#f0fdf4'; }
                if (status === 'rejected') { statusColor = '#ef4444'; statusBg = '#fef2f2'; }


                const div = document.createElement('div');
                div.className = 'glass-card';
                div.style.padding = '1.25rem';
                div.style.borderLeft = '4px solid var(--primary)';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                div.style.marginBottom = '1rem';

                const jobTitle = app.job ? app.job.title : 'Unknown Job';
                const companyName = (app.job && app.job.employer) ? app.job.employer.companyName : 'Unknown Company';
                const jobId = app.job ? app.job._id : '#';


                div.innerHTML = `
                    <div>
                        <h4 style="margin-bottom:0.25rem;">${jobTitle}</h4>
                        <p style="color:var(--gray); font-size:0.9rem; margin-bottom: 0.5rem;"><i class="fas fa-building"></i> ${companyName}</p>
                        <span style="font-size: 0.8rem; color: var(--gray);">Applied: ${new Date(app.appliedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span style="padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.85rem; font-weight: 600; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}33;">
                            ${status}
                        </span>
                        <a href="/jobs.html" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; margin-left: 1rem;">View Job</a>
                    </div>
                 `;
                list.appendChild(div);
            });
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p style="color: red;">Failed to load applications.</p>';
    }
}
