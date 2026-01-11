document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = '/jobs';
        return;
    }

    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.href = '/jobs';

    try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();

        if (data.success) {
            const job = data.data;
            document.getElementById('jobTitle').textContent = job.title;
            document.getElementById('companyName').textContent = job.employer ? job.employer.companyName : 'Confidential';
            document.getElementById('jobDesc').textContent = job.description;
            document.getElementById('jobResp').textContent = job.responsibilities;
            document.getElementById('jobQual').textContent = job.qualifications;
            document.getElementById('jobType').textContent = job.jobType;
            document.getElementById('salary').textContent = job.salaryRange;
            document.getElementById('location').textContent = job.location;

            document.getElementById('loading').style.display = 'none';
            document.getElementById('jobContent').style.display = 'block';

            // Check Auth for Apply Button
            const user = JSON.parse(localStorage.getItem('user'));
            const applyBtn = document.getElementById('applyBtn');

            if (!user) {
                applyBtn.textContent = 'Login to Apply';
                applyBtn.onclick = () => window.location.href = '/login';
            } else if (user.role === 'seeker') {
                applyBtn.textContent = 'Apply Now';
                applyBtn.onclick = () => applyForJob(id);
            } else {
                applyBtn.style.display = 'none'; // Employers/Admins
            }

        } else {
            alert('Job not found');
            window.location.href = '/jobs';
        }
    } catch (err) {
        console.error(err);
    }
});

async function applyForJob(id) {
    if (!confirm('Are you sure you want to apply for this job using your profile resume?')) return;

    try {
        const res = await fetch(`/api/jobs/${id}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (data.success) {
            alert('Application submitted successfully!');
            document.getElementById('applyBtn').textContent = 'Applied';
            document.getElementById('applyBtn').disabled = true;
            document.getElementById('applyBtn').classList.add('btn-outline');
            document.getElementById('applyBtn').classList.remove('btn-primary');
        } else {
            if (data.error.includes('already applied')) {
                alert('You have already applied to this job.');
            } else if (data.error.includes('resume')) {
                alert('Please upload a resume in your dashboard before applying.');
                window.location.href = '/dashboard-seeker';
            } else {
                alert('Error: ' + data.error);
            }
        }
    } catch (err) {
        console.error(err);
        alert('Something went wrong');
    }
}
