import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false); // Check if user applied
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await api.get(`/jobs/${id}`);
                if (res.data.success) {
                    setJob(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch job", err);
                setError("Failed to load job details");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'seeker') {
            addToast('Only job seekers can apply.', 'error');
            return;
        }

        if (!window.confirm('Are you sure you want to apply for this job using your profile resume?')) return;

        try {
            const res = await api.post(`/jobs/${id}/apply`);
            if (res.data.success) {
                addToast('Application submitted successfully!', 'success');
                setHasApplied(true);
            } else {
                addToast(res.data.error || 'Application failed', 'error');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || 'Something went wrong';
            if (msg.includes('already applied')) {
                addToast('You have already applied to this job.', 'info');
                setHasApplied(true);
            } else if (msg.includes('resume')) {
                addToast('Please upload a resume in your dashboard before applying.', 'warning');
                navigate('/dashboard-seeker');
            } else {
                addToast('Error: ' + msg, 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
                <p style={{ marginTop: '1rem', color: 'var(--color-gray)' }}>Loading job details...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <h3>{error || "Job not found"}</h3>
                <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Jobs</Link>
            </div>
        );
    }

    return (
        <main className="container" style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', background: 'var(--color-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--color-gray)' }}>
                            <i className="fas fa-building"></i>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{job.title}</h1>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 500 }}>{job.employer ? job.employer.companyName : 'Confidential'}</p>
                        </div>
                    </div>
                    <div>
                        {!user ? (
                            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Login to Apply</button>
                        ) : user.role === 'seeker' ? (
                            <button
                                onClick={handleApply}
                                className={`btn ${hasApplied ? 'btn-outline' : 'btn-primary'}`}
                                style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                                disabled={hasApplied}
                            >
                                {hasApplied ? 'Applied' : 'Apply Now'}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem' }}>
                {/* Left: Description */}
                <div className="glass-card">
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Description</h3>
                        <div style={{ whiteSpace: 'pre-line', color: '#475569', lineHeight: 1.7 }}>{job.description}</div>
                    </div>
                    {job.responsibilities && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Key Responsibilities</h3>
                            <div style={{ whiteSpace: 'pre-line', color: '#475569', lineHeight: 1.7 }}>{job.responsibilities}</div>
                        </div>
                    )}
                    {job.qualifications && (
                        <div>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Qualifications</h3>
                            <div style={{ whiteSpace: 'pre-line', color: '#475569', lineHeight: 1.7 }}>{job.qualifications}</div>
                        </div>
                    )}
                </div>

                {/* Right: Snapshot */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ background: 'white' }}>
                        <h4 style={{ marginBottom: '1.5rem' }}>Job Snapshot</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <i className="fas fa-briefcase" style={{ color: 'var(--color-primary)', marginTop: '3px' }}></i>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)' }}>Job Type</span>
                                    <strong style={{ color: 'var(--color-dark)' }}>{job.jobType}</strong>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <i className="fas fa-money-bill-wave" style={{ color: 'var(--color-secondary)', marginTop: '3px' }}></i>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)' }}>Salary Range</span>
                                    <strong style={{ color: 'var(--color-dark)' }}>{job.salaryRange}</strong>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <i className="fas fa-map-marker-alt" style={{ color: '#ef4444', marginTop: '3px' }}></i>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)' }}>Location</span>
                                    <strong style={{ color: 'var(--color-dark)' }}>{job.location}</strong>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card" style={{ background: 'var(--gradient-glass)', color: 'white', border: 'none' }}>
                        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Share this job</h4>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>Know someone who would be a great fit?</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem 1rem' }}>
                                <i className="fas fa-link"></i> Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default JobDetails;
