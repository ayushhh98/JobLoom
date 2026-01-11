document.addEventListener('DOMContentLoaded', () => {
    fetchApplications();
    fetchStats();
});

async function fetchApplications() {
    const listContainer = document.getElementById('appliedJobsList');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const token = localStorage.getItem('token');
        const headers = {};

        // Use Bearer token if available, otherwise rely on cookie
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/jobs/applied', { headers });

        if (res.status === 401) {
            localStorage.removeItem('token'); // Clear invalid token if any
            window.location.href = '/login';
            return;
        }

        const data = await res.json();

        if (data.success) {
            renderApplications(data.data);
            updateStats(data.data);
        } else {
            listContainer.innerHTML = '<p class="text-center">Failed to load applications.</p>';
        }
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<p class="text-center">Error loading applications.</p>';
    }
}

function renderApplications(applications) {
    const listContainer = document.getElementById('appliedJobsList');
    listContainer.innerHTML = '';

    if (applications.length === 0) {
        listContainer.innerHTML = `
            <div class="applications-empty-state">
                <i class="fas fa-briefcase"></i>
                <p>No active applications found.</p>
                <a href="/jobs" class="btn btn-primary" style="margin-top:1rem;">Find Jobs</a>
            </div>
        `;
        return;
    }

    applications.forEach(app => {
        // Handle if job was deleted but application remains
        const job = app.job || { title: 'Unknown Role', employer: { companyName: 'Unknown Company' }, location: 'Unknown' };
        const companyName = job.employer ? job.employer.companyName : 'Confidential';
        const dateApplied = new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Status Styling
        let statusClass = 'status-applied';
        let statusText = 'Applied';

        switch (app.status) {
            case 'interview': statusClass = 'status-interview'; statusText = 'Interview'; break;
            case 'reviewed': statusClass = 'status-reviewed'; statusText = 'Reviewed'; break;
            case 'rejected': statusClass = 'status-rejected'; statusText = 'Rejected'; break;
            case 'accepted': statusClass = 'status-success'; statusText = 'Accepted'; break;
            default: statusClass = 'status-applied'; statusText = 'Applied';
        }

        const item = document.createElement('div');
        item.className = 'application-item-full';
        item.innerHTML = `
            <div class="job-details-col">
                <div class="company-logo-placeholder-sm" style="width:40px; height:40px; background:#e2e8f0; display:flex; align-items:center; justify-content:center; border-radius:8px; margin-right:1rem;">
                    <span style="font-weight:bold; color:#64748b;">${companyName[0].toUpperCase()}</span>
                </div>
                <div class="job-info">
                    <h5>${job.title}</h5>
                    <p class="company-name">${companyName}</p>
                    <span class="detail-tag"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                </div>
            </div>
            <div class="status-col">
                <div class="status-badge ${statusClass}">${statusText}</div>
            </div>
            <div class="date-col">
                <p class="date-info">Applied: ${dateApplied}</p>
            </div>
            <div class="actions-col">
                 ${job._id ? `<a href="/job-details?id=${job._id}" class="btn btn-outline btn-sm" style="margin-right:0.5rem;">View Job</a>` : '<span class="text-muted" style="margin-right:0.5rem;">Job Closed</span>'}
                 <button onclick="withdrawApp('${app._id}')" class="btn btn-outline btn-sm" style="border-color: #ef4444; color: #ef4444;"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

async function withdrawApp(appId) {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/jobs/application/${appId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();

        if (data.success) {
            // Remove element or refresh
            fetchApplications();
        } else {
            alert(data.error || 'Failed to withdraw application');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred');
    }
}

function updateStats(apps) {
    // Simple stat calculation
    const applied = apps.length;
    const reviewed = apps.filter(a => a.status === 'reviewed').length;
    const interview = apps.filter(a => a.status === 'interview').length;

    // Update DOM
    if (document.getElementById('statApplied')) document.getElementById('statApplied').innerText = applied;
    if (document.getElementById('statReviewed')) document.getElementById('statReviewed').innerText = reviewed;
    if (document.getElementById('statInterview')) document.getElementById('statInterview').innerText = interview;
}

function fetchStats() {
    // Optional: Fetch user profile stats if separate API exists, 
    // for now we calculate from the applications list in updateStats
}
