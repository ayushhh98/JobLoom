import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { generateGoogleCalendarLink, downloadICSFile } from '../utils/calendarUtils';
import api from '../services/api';
import candidatesBg from '../assets/candidates_bg_hd.png';
import jobsBg from '../assets/jobs_bg_hd.png';
import settingsBg from '../assets/settings_bg_hd.png';
import importBg from '../assets/import_bg_hd.png';
import dashboardBg from '../assets/dashboard_bg_hd.png';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as XLSX from 'xlsx';
import KanbanBoard from '../components/KanbanBoard';
import AnalyticsTab from '../components/AnalyticsTab';
import MessagesTab from '../components/MessagesTab';
import CompanyManagement from '../components/CompanyManagement';

const stripePromise = loadStripe('pk_test_51PsdzhRu4gK8Wk48Wd3XjTzV8xXy9G0zQ5Yq7M6LvB2JcN3fH1rA5sK9oD4gT7uV1eR3wX6yZ0mP8nL2kQ4j5h7');


/**
 * Toast Notification Component
 */


/**
 * Improved Employer Dashboard
 */
const DashboardEmployer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Auth Context Integration
    const { user, setUser, loading: authLoading } = useAuth();
    // const [user, setUser] = useState(null); // Local state replaced by Context

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const activeTab = searchParams.get('tab') || 'dashboard';
    const [myJobs, setMyJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Toast State
    const { addToast } = useToast();
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on('notification', (data) => {
            addToast(data.message, 'info');
            // Play sound or update notification count here
            const audio = new Audio('/assets/sounds/notification.mp3'); // Placeholder
            // audio.play().catch(e => console.log('Audio play failed', e)); 
        });

        return () => {
            socket.off('notification');
        };
    }, [socket, addToast]);

    // Interview/Message State
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [actionCandidate, setActionCandidate] = useState(null); // Stores { id, name, jobId, applicationId }
    const [scheduleData, setScheduleData] = useState({ date: '', time: '', link: '', note: '' });
    const [messageData, setMessageData] = useState({ subject: '', body: '' });

    // Handle Delete Job
    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            try {
                const res = await api.delete(`/jobs/${jobId}`);
                if (res.data.success) {
                    setMyJobs(prev => prev.filter(j => j._id !== jobId));
                    addToast('Job deleted successfully', 'success');

                    // Update stats locally
                    setStats(prev => ({
                        ...prev,
                        activeJobs: prev.activeJobs - 1
                    }));
                }
            } catch (err) {
                console.error('Failed to delete job', err);
                addToast(err.response?.data?.error || 'Failed to delete job', 'error');
            }
        }
    };

    // Handle Duplicate Job
    const handleDuplicateJob = async (jobId) => {
        if (!window.confirm('Duplicate this job posting? This will create a copy with "(Copy)" in the title.')) return;
        try {
            const res = await api.post(`/jobs/${jobId}/duplicate`);
            if (res.data.success) {
                setMyJobs([res.data.data, ...myJobs]);
                addToast('Job duplicated successfully', 'success');
            }
        } catch (err) {
            console.error("Duplicate failed", err);
            addToast('Failed to duplicate job', 'error');
        }
    };

    // Handle Toggle Status (Close/Activate)
    const handleToggleStatus = async (jobId, currentStatus) => {
        const newStatus = currentStatus === 'closed' ? 'active' : 'closed';
        if (!window.confirm(`Are you sure you want to ${newStatus === 'closed' ? 'close' : 'activate'} this job?`)) return;

        try {
            const res = await api.put(`/jobs/${jobId}`, { status: newStatus });
            if (res.data.success) {
                setMyJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
                addToast(`Job ${newStatus === 'closed' ? 'closed' : 'activated'}`, 'success');
            }
        } catch (err) {
            console.error("Status update failed", err);
            addToast('Failed to update status', 'error');
        }
    };

    // Stats
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplications: 0,
        interviews: 0,
        views: 0,
        pending: 0
    });

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            console.log("DashboardEmployer: No user found, redirecting to login.");
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            // User from context
            setLoading(true);

            try {
                const userData = user; // Use context user directly
                // setUser(userData); // Already set in context

                // Fetch Jobs and Stats
                try {
                    const res = await api.get('/jobs/employer/stats');
                    if (res.data.success) {
                        const jobs = res.data.data;
                        setMyJobs(jobs);

                        const activeJobsCount = jobs.filter(j => j.status !== 'closed').length;
                        const totalApplications = jobs.reduce((acc, job) => acc + (job.applications ? job.applications.length : 0), 0);
                        const interviewsCount = jobs.reduce((acc, job) => {
                            if (!job.applications) return acc;
                            return acc + job.applications.filter(app => ['Reviewed', 'Accepted', 'Interviewing'].includes(app.status)).length;
                        }, 0);

                        setStats({
                            activeJobs: activeJobsCount,
                            applications: totalApplications,
                            interviews: interviewsCount,
                            views: res.data.profileViews || 0,
                            pending: jobs.reduce((acc, job) => acc + (job.applications?.filter(a => a.status === 'Applied').length || 0), 0)
                        });
                    }
                } catch (err) {
                    console.error("Stats fetch failed, falling back", err);
                    const res = await api.get('/jobs');
                    if (res.data.success) {
                        const allJobs = res.data.data;
                        const employerJobs = allJobs.filter(job => {
                            const employerId = typeof job.employer === 'object' ? job.employer?._id : job.employer;
                            const userId = userData._id || userData.id;
                            return String(employerId) === String(userId);
                        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setMyJobs(employerJobs);
                    }
                }

            } catch (err) {
                console.error('Failed to load dashboard data', err);
                setError('Failed to load your dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, authLoading, navigate]);

    const filteredJobs = myJobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || (filterStatus === 'active' && job.status !== 'closed') || (filterStatus === 'closed' && job.status === 'closed');
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--color-gray)' }}>Loading your dashboard...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '3rem' }}>
                    <i className="fas fa-exclamation-circle" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}></i>
                    <h3>Oops! Something went wrong</h3>
                    <p style={{ color: 'var(--color-gray)', marginBottom: '2rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            {/* Hero Section - Only Visible on 'dashboard' tab */}
            {activeTab === 'dashboard' && (
                <section className="hero-section" style={{
                    // backgroundImage removed (handled by overlay)
                    padding: '6rem 0',
                    marginBottom: '2rem',
                    color: 'white',
                    position: 'relative',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden',
                    transition: 'background-size 20s ease'
                }}>
                    <div className="banner-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 50%, rgba(15, 23, 42, 0.4) 100%), url(${dashboardBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        animation: 'bannerZoom 20s infinite alternate',
                        zIndex: 1
                    }}></div>
                    <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '3rem' }}>
                            <div style={{ maxWidth: '700px' }}>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    marginBottom: '1.5rem',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    <i className="fas fa-chart-line" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
                                    Executive Dashboard
                                </div>
                                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1', color: '#fff', textShadow: '0 2px 4px rgba(13, 13, 13, 0.3)' }}>
                                    Welcome back, <br />
                                    <span style={{
                                        color: '#6366f1',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                    }}>
                                        {user ? user.companyName || user.name : 'Employer'}
                                    </span>
                                </h1>
                                <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: '1.6', maxWidth: '600px', color: '#cbd5e1' }}>
                                    Oversee your recruitment pipeline, analyze performance metrics, and build your dream team from one central command center.
                                </p>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                flexDirection: 'column',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '2rem',
                                borderRadius: '20px',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                            }}>
                                <Link to="/post-job" className="btn" style={{
                                    backgroundColor: 'var(--color-primary-soft)',
                                    color: 'white',
                                    fontWeight: '700',
                                    padding: '1rem 2rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                                    transition: 'all 0.3s'
                                }}>
                                    <i className="fas fa-plus" style={{ marginRight: '0.75rem' }}></i> Post New Job
                                </Link>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    <i className="fas fa-info-circle"></i>
                                    <span>{stats.pending || 0} pending applications</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Jobs Banner */}
            {activeTab === 'jobs' && (
                <div style={{
                    position: 'relative',
                    padding: '4rem 0',
                    margin: '2rem 0',
                    marginBottom: '2rem',
                    color: 'white',
                    overflow: 'hidden',
                    borderRadius: '24px',
                    boxShadow: '0 20px 25px -5px rgba(56, 189, 248, 0.15)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(7, 89, 133, 0.85), rgba(15, 23, 42, 0.8)), url(${jobsBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        animation: 'bannerZoom 20s infinite alternate',
                        zIndex: 0
                    }}></div>
                    <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ maxWidth: '800px' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>Find Your Next <br /> <span style={{ color: '#fbbf24' }}>Star Employee</span> Today</h2>
                            <Link to="/post-job" className="btn" style={{ backgroundColor: 'white', color: '#4f46e5', fontWeight: '700', padding: '0.875rem 2rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}><i className="fas fa-plus-circle"></i> Post New Job</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Candidates Banner */}
            {activeTab === 'candidates' && (
                <div style={{
                    position: 'relative',
                    padding: '4rem 0',
                    margin: '2rem 0',
                    marginBottom: '2rem',
                    color: 'white',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url(/images/candidate-hero.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        animation: 'bannerZoom 20s infinite alternate',
                        zIndex: 0
                    }}></div>
                    <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ maxWidth: '800px' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>Build Your <br /> <span style={{ color: '#fcd34d' }}>Dream Team</span></h2>
                        </div>
                    </div>
                </div>
            )}


            {/* Import Banner */}
            {activeTab === 'import' && (
                <div style={{
                    position: 'relative',
                    padding: '4rem 0',
                    margin: '2rem 0',
                    marginBottom: '2rem',
                    color: 'white',
                    overflow: 'hidden',
                    borderRadius: '24px',
                    boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.15)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(6, 78, 59, 0.9), rgba(6, 78, 59, 0.8)), url(${importBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        animation: 'bannerZoom 20s infinite alternate',
                        zIndex: 0
                    }}></div>
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Import & Manage <br /> <span style={{ color: '#a7f3d0' }}>Large Datasets</span></h2>
                    </div>
                </div>
            )}

            {/* Settings Banner */}
            {activeTab === 'settings' && (
                <div style={{
                    position: 'relative',
                    padding: '4rem 0',
                    margin: '2rem 0',
                    marginBottom: '2rem',
                    color: 'white',
                    overflow: 'hidden',
                    borderRadius: '24px',
                    boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url(${settingsBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        animation: 'bannerZoom 20s infinite alternate',
                        zIndex: 0
                    }}></div>
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Account & <br /> <span style={{ color: '#94a3b8' }}>Preferences</span></h2>
                    </div>
                </div>
            )}

            <main className={(activeTab === 'jobs' || activeTab === 'settings' || activeTab === 'import' || activeTab === 'candidates') ? '' : 'container'} style={{ paddingBottom: '4rem', width: (activeTab === 'jobs' || activeTab === 'settings' || activeTab === 'import' || activeTab === 'candidates') ? '99%' : 'auto', maxWidth: (activeTab === 'jobs' || activeTab === 'settings' || activeTab === 'import' || activeTab === 'candidates') ? '100%' : undefined }}>

                {/* Tab Content: Analytics */}
                {/* Tab Content: Analytics */}
                {activeTab === 'analytics' && <AnalyticsTab />}
                {activeTab === 'messages' && <MessagesTab />}

                {/* Tab Content: Dashboard */}
                {activeTab === 'dashboard' && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <StatCard icon="briefcase" color="#6366f1" value={stats.activeJobs} label="Active Jobs" trend="+2 this month" />
                            <StatCard icon="file-alt" color="#10b981" value={stats.applications} label="Applications" trend="+12% vs last week" />
                            <StatCard icon="clock" color="#f97316" value={stats.pending || 0} label="Pending Review" trend="Needs Action" />
                            <StatCard icon="user-clock" color="#f59e0b" value={stats.interviews} label="Interviews" trend="3 today" />
                            <StatCard icon="eye" color="#3b82f6" value={stats.views} label="Profile Views" trend="+45 new" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                            <div className="glass-card" style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Job Postings</h3>
                                    <button className="btn-text" onClick={() => setSearchParams({ tab: 'jobs' })} style={{ color: 'var(--color-primary-soft)', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer' }}>View All</button>
                                </div>
                                {myJobs.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                        <p style={{ color: 'var(--color-gray)' }}>You haven't posted any jobs yet.</p>
                                        <Link to="/post-job" style={{ color: 'var(--color-primary-soft)', textDecoration: 'none', fontWeight: '600' }}>Post your first job</Link>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.875rem' }}>JOB TITLE</th>
                                                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.875rem' }}>APPLICANTS</th>
                                                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.875rem' }}>STATUS</th>
                                                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.875rem' }}>ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myJobs.slice(0, 5).map(job => (
                                                    <tr key={job._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{job.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{job.location}</div>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem' }}><span style={{ fontWeight: '600' }}>{job.applications?.length || 0}</span></td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: job.status === 'closed' ? '#fee2e2' : '#d1fae5', color: job.status === 'closed' ? '#ef4444' : '#059669' }}>
                                                                {job.status === 'closed' ? 'Closed' : 'Active'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>
                                                            <button onClick={() => navigate(`/edit-job/${job._id}`)} style={{ color: 'var(--color-primary-soft)', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit Job"><i className="fas fa-edit"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white', borderRadius: '24px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Pro Hiring Tip</h4>
                                    <p style={{ fontSize: '0.95rem', opacity: 0.95, marginBottom: '1.5rem', color: 'white' }}>Jobs with clear salary ranges get 30% more qualified applicants.</p>
                                </div>
                                <div className="glass-card" style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0' }}>Quick Actions</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <ActionButton icon="user-plus" label="Invite Candidate" />
                                        <ActionButton icon="calendar-check" label="Schedule Interview" />
                                        <ActionButton icon="file-download" label="Export Reports" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Jobs */}
                {activeTab === 'jobs' && (
                    <div className="animate-fade-in" style={{ padding: '0 2rem' }}>
                        {/* Header Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>My <span className="text-primary">Job Listings</span></h2>
                                <p style={{ color: 'var(--color-gray)', marginTop: '0.5rem' }}>Manage your active openings and track applications.</p>
                            </div>
                            <Link to="/post-job" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-plus"></i> Post New Job
                            </Link>
                        </div>

                        {/* Search and Filters */}
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <i className="fas fa-search" style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
                                <input
                                    type="text"
                                    placeholder="Search by job title, ID, or keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '14px', border: '2px solid transparent', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#334155', transition: 'all 0.2s', outline: 'none' }}
                                    onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                    onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div style={{ height: '3rem', width: '1px', background: '#e2e8f0' }}></div>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ padding: '1rem 3rem 1rem 1.5rem', borderRadius: '14px', border: '2px solid transparent', backgroundColor: '#f8fafc', fontWeight: '600', color: '#475569', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em', minWidth: '180px' }}
                                    onFocus={e => { e.target.style.backgroundColor = 'white'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                    onBlur={e => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                >
                                    <option value="all">All Jobs</option>
                                    <option value="active">Active Jobs</option>
                                    <option value="closed">Closed Jobs</option>
                                </select>
                            </div>
                        </div>

                        {/* Job Grid */}
                        {filteredJobs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0', opacity: 0.8 }}>
                                <div style={{ width: '80px', height: '80px', background: '#eef2ff', color: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem', boxShadow: '0 0 0 8px #f5f3ff' }}>
                                    <i className="fas fa-briefcase"></i>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1e293b', fontWeight: '700' }}>No Jobs Found</h3>
                                <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>We couldn't find any jobs matching your current search filters. Try adjusting them or create a new job posting.</p>
                                <Link to="/post-job" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)' }}><i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Create Job Post</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                                {filteredJobs.map((job) => (
                                    <div key={job._id} className="job-card-premium" style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #eef2ff', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
                                    >
                                        <div style={{ padding: '1.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                                                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#4f46e5', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }}>
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <span style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '50px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    backgroundColor: job.status === 'closed' ? '#fef2f2' : '#ecfdf5',
                                                    color: job.status === 'closed' ? '#ef4444' : '#059669',
                                                    border: `1px solid ${job.status === 'closed' ? '#fecaca' : '#a7f3d0'}`
                                                }}>
                                                    {job.status || 'Active'}
                                                </span>
                                            </div>

                                            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.3' }}>{job.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-map-marker-alt" style={{ color: '#94a3b8' }}></i>{job.location}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-clock" style={{ color: '#94a3b8' }}></i>{job.type || 'Full Time'}</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '1px', background: '#f1f5f9', padding: '1px', borderRadius: '16px', overflow: 'hidden' }}>
                                                <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: '#f8fafc' }}>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applicants</div>
                                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>{job.applications?.length || 0}</div>
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: '#f8fafc' }}>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Views</div>
                                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>{Math.floor(Math.random() * 50) + (job.applications?.length || 0) * 2}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '1.25rem 1.75rem', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', marginTop: 'auto', alignItems: 'center' }}>
                                            <button
                                                onClick={() => navigate(`/edit-job/${job._id}`)}
                                                style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s', fontSize: '0.9rem' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; }}
                                                title="Edit Details"
                                            >
                                                <i className="fas fa-pen-to-square"></i> Edit
                                            </button>

                                            <button
                                                onClick={() => handleDuplicateJob(job._id)}
                                                style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1px solid #e0e7ff', background: '#eef2ff', fontWeight: '600', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s', fontSize: '0.9rem' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = 'white'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }}
                                                title="Duplicate Job"
                                            >
                                                <i className="fas fa-copy"></i>
                                            </button>

                                            <button
                                                onClick={() => handleToggleStatus(job._id, job.status)}
                                                style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: `1px solid ${job.status === 'closed' ? '#d1fae5' : '#ffedd5'}`, background: job.status === 'closed' ? '#ecfdf5' : '#fff7ed', fontWeight: '600', color: job.status === 'closed' ? '#059669' : '#ea580c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s', fontSize: '0.9rem' }}
                                                title={job.status === 'closed' ? "Reopen Job" : "Close Job"}
                                            >
                                                <i className={`fas fa-${job.status === 'closed' ? 'redo-alt' : 'archive'}`}></i>
                                            </button>

                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#dc2626', cursor: 'pointer', transition: 'all 0.2s', width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#dc2626'; }}
                                                title="Delete Permanently"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Candidates */}
                {activeTab === 'candidates' && (
                    <CandidatesTab
                        jobs={myJobs}
                        setShowScheduleModal={setShowScheduleModal}
                        setShowMessageModal={setShowMessageModal}
                        setActionCandidate={setActionCandidate}
                        addToast={addToast}
                    />
                )}

                {/* Tab Content: Import Data */}
                {activeTab === 'import' && (
                    <ImportCertTab addToast={addToast} />
                )}

                {/* Tab Content: Settings */}
                {activeTab === 'settings' && (
                    <SettingsTab user={user} setUser={setUser} />
                )}
            </main>

            {/* Schedule Interview Modal */}
            {showScheduleModal && (
                <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="modal-content glass-card" style={{ background: 'white', padding: '0', borderRadius: '20px', width: '500px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Schedule Interview</h3>
                            <button onClick={() => setShowScheduleModal(false)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                        </div>

                        <div style={{ padding: '1.5rem 2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                                <img src={actionCandidate?.applicant?.profilePhoto || `https://ui-avatars.com/api/?name=${actionCandidate?.name}`} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Candidate</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{actionCandidate?.name}</div>
                                </div>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await api.post('/notifications/schedule', {
                                        candidateId: actionCandidate.id,
                                        date: scheduleData.date + ' ' + scheduleData.time,
                                        link: scheduleData.link,
                                        message: scheduleData.note,
                                        jobId: actionCandidate.jobId,
                                        title: 'Interview Invitation'
                                    });
                                    addToast('Interview Scheduled Successfully!', 'success');
                                    setShowScheduleModal(false);
                                    setScheduleData({ date: '', time: '', link: '', note: '' });
                                } catch (err) {
                                    addToast('Failed to schedule interview', 'error');
                                    console.error(err);
                                }
                            }}>
                                <div className="form-group mb-3">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group mb-3">
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Date</label>
                                            <input type="date" className="form-control" required style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })} />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Time</label>
                                            <input type="time" className="form-control" required style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Meeting Link</label>
                                        <input type="url" className="form-control" placeholder="https://meet.google.com/..." required style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} onChange={(e) => setScheduleData({ ...scheduleData, link: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Note / Agenda</label>
                                        <textarea className="form-control" rows="3" style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} onChange={(e) => setScheduleData({ ...scheduleData, note: e.target.value })} placeholder="e.g. Technical Screen"></textarea>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!scheduleData.date || !scheduleData.time) return addToast('Please select date and time first', 'error');
                                                const dateTime = new Date(`${scheduleData.date}T${scheduleData.time}`);
                                                const url = generateGoogleCalendarLink('Interview with ' + actionCandidate.name, scheduleData.note, scheduleData.link, dateTime);
                                                window.open(url, '_blank');
                                            }}
                                            style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600' }}
                                        >
                                            <i className="fab fa-google"></i> Google Cal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!scheduleData.date || !scheduleData.time) return addToast('Please select date and time first', 'error');
                                                const dateTime = new Date(`${scheduleData.date}T${scheduleData.time}`);
                                                downloadICSFile('Interview with ' + actionCandidate.name, scheduleData.note, scheduleData.link, dateTime);
                                            }}
                                            style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600' }}
                                        >
                                            <i className="fas fa-file-download"></i> Outlook/iCal
                                        </button>
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(67, 56, 202, 0.3)' }}>Send Invitation</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && (
                <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="modal-content glass-card" style={{ background: 'white', padding: '0', borderRadius: '20px', width: '500px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Message Candidate</h3>
                            <button onClick={() => setShowMessageModal(false)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                        </div>

                        <div style={{ padding: '1.5rem 2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                                <img src={actionCandidate?.applicant?.profilePhoto || `https://ui-avatars.com/api/?name=${actionCandidate?.name}`} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Recipient</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{actionCandidate?.name}</div>
                                </div>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await api.post('/notifications/message', {
                                        candidateId: actionCandidate.id,
                                        title: messageData.subject,
                                        message: messageData.body,
                                        jobId: actionCandidate.jobId
                                    });
                                    addToast('Message Sent Successfully!', 'success');
                                    setShowMessageModal(false);
                                    setMessageData({ subject: '', body: '' });
                                } catch (err) {
                                    addToast('Failed to send message', 'error');
                                    console.error(err);
                                }
                            }}>
                                <div className="form-group mb-3">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Subject</label>
                                    <input type="text" className="form-control" required style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })} placeholder="e.g., Regarding your application" />
                                </div>
                                <div className="form-group mb-3">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Message</label>
                                    <textarea className="form-control" rows="5" required style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} onChange={(e) => setMessageData({ ...messageData, body: e.target.value })} placeholder="Write your message here..."></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .job-card-premium:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
            `}</style>
        </div>
    );
};

function TabButton({ active, onClick, icon, label }) {
    return (
        <button onClick={onClick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', border: 'none', background: active ? '#f1f5f9' : 'transparent', color: active ? '#6366f1' : '#64748b', fontWeight: active ? '700' : '500', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            <i className={`fas fa-${icon}`}></i>
            <span className="tab-label">{label}</span>
        </button>
    );
}

function StatCard({ icon, color, value, label, trend }) {
    return (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: `${color}15`, color: color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}><i className={`fas fa-${icon}`}></i></div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600', backgroundColor: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '4px', height: 'fit-content' }}>{trend}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.25rem' }}>{value}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>{label}</div>
        </div>
    );
}

function ActionButton({ icon, label }) {
    return (
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem', border: '1px solid #f1f5f9', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}>
            <i className={`fas fa-${icon}`} style={{ color: 'var(--color-primary-soft)', width: '20px' }}></i>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>{label}</span>
        </button>
    );
}

function ProfileModal({ candidate, onClose }) {
    if (!candidate) return null;
    const user = candidate.applicant || {};

    const [aiData, setAiData] = useState(null);

    useEffect(() => {
        if (candidate?.job && candidate?.applicant) {
            api.post('/ai/fit-score', {
                jobId: candidate.job._id || candidate.job,
                candidateId: candidate.applicant._id || candidate.applicant.id
            }).then(res => {
                if (res.data.success) setAiData(res.data.data);
            }).catch(err => console.error("AI Fetch Error", err));
        }
    }, [candidate]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
            <div className="animate-fade-in" style={{ backgroundColor: '#f8fafc', borderRadius: '24px', width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>

                {/* Header */}
                <div style={{ background: 'white', padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Candidate Profile</h2>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Content */}
                <div style={{ paddingBottom: '2rem' }}>
                    {/* Hero Banner */}
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', width: '100%' }}></div>

                    {/* Profile Header Info */}
                    <div style={{ padding: '0 2.5rem', marginTop: '-60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
                            <img
                                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}`}
                                style={{ width: '130px', height: '130px', borderRadius: '50%', border: '6px solid white', objectFit: 'cover', background: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <div style={{ paddingBottom: '0.5rem' }}>
                                <h1 style={{ fontSize: '1.875rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#1e293b' }}>{user.name}</h1>
                                <p style={{ margin: 0, fontSize: '1.1rem', color: '#64748b', fontWeight: '500' }}>{user.headline || 'Seeking Opportunities'}</p>
                            </div>
                        </div>

                        <div style={{ paddingBottom: '1rem' }}>
                            {user.resume && (
                                <a href={user.resume} target="_blank" className="btn" style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)',
                                    textDecoration: 'none',
                                    transition: 'transform 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <i className="fas fa-file-download"></i> Download Resume
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ padding: '2.5rem 2.5rem 0', display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>

                        {/* Left Col */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* AI Fit Score Card */}
                            {aiData && (
                                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '1.5rem 2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', color: 'white', display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)', zIndex: 0 }}></div>
                                    <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(${aiData.score >= 80 ? '#10b981' : aiData.score >= 50 ? '#f59e0b' : '#ef4444'} ${aiData.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
                                            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.5rem' }}>
                                                {aiData.score}%
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                                        <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', opacity: 0.7, marginBottom: '0.25rem' }}>AI Fit Analysis</div>
                                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700', color: aiData.score >= 80 ? '#34d399' : aiData.score >= 50 ? '#fbbf24' : '#f87171' }}>{aiData.analysis.split('.')[0]}</h3>
                                        <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.8, lineHeight: '1.5' }}>{aiData.analysis.split('.').slice(1).join('.')}</p>
                                    </div>
                                </div>
                            )}

                            {/* Contact Card */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Information</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem' }}><i className="fas fa-envelope"></i></div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginBottom: '0.2rem' }}>Email</div>
                                            <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>{user.email || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem' }}><i className="fas fa-phone"></i></div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginBottom: '0.2rem' }}>Phone</div>
                                            <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>{user.contact || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem' }}><i className="fas fa-map-marker-alt"></i></div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginBottom: '0.2rem' }}>Location</div>
                                            <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>{user.location || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Card */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Professional Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {user.skills ? (
                                        (Array.isArray(user.skills) ? user.skills : user.skills.split(',')).map((skill, i) => (
                                            <span key={i} style={{
                                                background: '#eff6ff',
                                                color: '#3b82f6',
                                                padding: '0.6rem 1.25rem',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {skill.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No skills listed</div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Right Col */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Application Status */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Application Status</h4>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: candidate.status === 'Accepted' ? '#ecfdf5' : '#f8fafc',
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    border: `2px solid ${candidate.status === 'Accepted' ? '#d1fae5' : '#e2e8f0'}`
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: candidate.status === 'Accepted' ? '#10b981' : '#cbd5e1',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                    }}>
                                        <i className={`fas fa-${candidate.status === 'Accepted' ? 'check' : 'circle'}`}></i>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Current Stage</div>
                                        <div style={{ fontSize: '1.1rem', color: candidate.status === 'Accepted' ? '#059669' : '#334155', fontWeight: '800' }}>{candidate.status}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Web Presence */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Web Presence</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {user.social?.linkedin ? (
                                        <a href={user.social.linkedin} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#334155', fontWeight: '600', transition: 'background 0.2s', border: '1px solid transparent' }} onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
                                            <i className="fab fa-linkedin" style={{ fontSize: '1.4rem', color: '#0077b5' }}></i>
                                            <span style={{ flex: 1 }}>LinkedIn Profile</span>
                                            <i className="fas fa-external-link-alt" style={{ fontSize: '0.9rem', color: '#94a3b8' }}></i>
                                        </a>
                                    ) : (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem' }}>No social profiles linked.</div>
                                    )}
                                    {/* Add other socials similarly if data exists */}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .modal-content > div:last-child > div:last-child {
                        grid-template-columns: 1fr !important;
                    }
                    .modal-content h1 { font-size: 1.5rem !important; }
                }
                @keyframes bannerZoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

function CandidatesTab({ jobs, setShowScheduleModal, setShowMessageModal, setActionCandidate, addToast }) {
    const [candidates, setCandidates] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [viewMode, setViewMode] = useState('board'); // 'list' or 'board'
    const [filterJob, setFilterJob] = useState('all');
    const [filterDate, setFilterDate] = useState('all');

    const uniqueJobs = jobs ? [...new Set(jobs.map(j => j.title))] : [];

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await api.get('/jobs/employer/applications');
                if (res.data.success) {
                    setCandidates(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch applications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            // Optimistic update
            setCandidates(prev => prev.map(c =>
                c._id === applicationId ? { ...c, status: newStatus } : c
            ));

            const res = await api.put(`/jobs/application/${applicationId}/status`, { status: newStatus });
            if (res.data.success) {
                addToast(`Candidate moved to ${newStatus}`, 'success');
            } else {
                // Revert if failed
                console.error("Failed to update status on server");
            }
        } catch (err) {
            console.error("Failed to update status", err);
            addToast('Failed to update status', 'error');
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const matchesStatus = filterStatus === 'all' || (c.status && c.status.toLowerCase() === filterStatus.toLowerCase());
        const matchesSearch = (c.applicant?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (c.job?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesJob = filterJob === 'all' || c.job?.title === filterJob;

        let matchesDate = true;
        if (filterDate !== 'all') {
            const appliedDate = new Date(c.appliedAt);
            const now = new Date();
            const diffTime = Math.abs(now - appliedDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (filterDate === '7days') matchesDate = diffDays <= 7;
            if (filterDate === '30days') matchesDate = diffDays <= 30;
        }

        return matchesStatus && matchesSearch && matchesJob && matchesDate;
    });

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' };
            case 'reviewed': return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
            case 'accepted': return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
            case 'rejected': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
            default: return { bg: '#f8fafc', color: '#475569', border: '#cbd5e1' };
        }
    };

    if (loading) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--color-gray)' }}><i className="fas fa-spinner fa-spin fa-2x"></i><p style={{ marginTop: '1rem' }}>Loading candidates...</p></div>;

    return (
        <div className="animate-fade-in" style={{ padding: '1rem', maxWidth: '100%', margin: '0 auto' }}>
            {/* Header & Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)', border: '1px solid #eef2ff', boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(255,255,255,0) 70%)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ padding: '10px', borderRadius: '14px', background: '#eef2ff', color: '#6366f1' }}><i className="fas fa-users" style={{ fontSize: '1.5rem' }}></i></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6366f1', background: '#e0e7ff', padding: '4px 10px', borderRadius: '20px' }}>Total</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', lineHeight: '1', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{candidates.length}</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Active Applications</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #fffbf0 100%)', border: '1px solid #fff7ed', boxShadow: '0 10px 30px -5px rgba(249, 115, 22, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, rgba(255,255,255,0) 70%)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ padding: '10px', borderRadius: '14px', background: '#fff7ed', color: '#f97316' }}><i className="fas fa-hourglass-half" style={{ fontSize: '1.5rem' }}></i></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f97316', background: '#ffedd5', padding: '4px 10px', borderRadius: '20px' }}>Action Needed</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', lineHeight: '1', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{candidates.filter(c => c.status === 'Pending').length}</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Pending Review</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '1px solid #f0fdf4', boxShadow: '0 10px 30px -5px rgba(34, 197, 94, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, rgba(255,255,255,0) 70%)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ padding: '10px', borderRadius: '14px', background: '#f0fdf4', color: '#22c55e' }}><i className="fas fa-calendar-check" style={{ fontSize: '1.5rem' }}></i></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#22c55e', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px' }}>Ongoing</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', lineHeight: '1', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{candidates.filter(c => c.status === 'Interviewing').length}</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Active Interviews</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '2rem',
                alignItems: 'center',
                background: 'white',
                padding: '1.25rem',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.01)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
                    <input
                        type="text"
                        placeholder="Search candidates by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.9rem 1rem 0.9rem 3rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem',
                            color: '#334155',
                            transition: 'all 0.2s outline-none',
                            outline: 'none'
                        }}
                        onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                        onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Filters */}
                    <div className="filter-group">
                        <select
                            value={filterJob}
                            onChange={(e) => setFilterJob(e.target.value)}
                            style={{ padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontWeight: '500', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem center', backgroundSize: '0.9em', maxWidth: '200px' }}
                        >
                            <option value="all">Filter by Job (All)</option>
                            {uniqueJobs.map(job => (
                                <option key={job} value={job}>{job}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{ padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontWeight: '500', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem center', backgroundSize: '0.9em' }}
                        >
                            <option value="all">Any Time</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                        </select>
                    </div>

                    <div style={{ width: '1px', height: '2rem', background: '#e2e8f0', margin: '0 0.5rem' }}></div>

                    {/* View Toggle */}
                    <div style={{ background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px', display: 'flex' }}>
                        <button
                            onClick={() => setViewMode('board')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderRadius: '10px',
                                background: viewMode === 'board' ? 'white' : 'transparent',
                                color: viewMode === 'board' ? 'var(--color-primary)' : '#64748b',
                                boxShadow: viewMode === 'board' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <i className="fas fa-columns"></i> Board
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderRadius: '10px',
                                background: viewMode === 'list' ? 'white' : 'transparent',
                                color: viewMode === 'list' ? 'var(--color-primary)' : '#64748b',
                                boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <i className="fas fa-list"></i> List
                        </button>
                    </div>
                </div>
            </div>

            {/* Content View */}
            {viewMode === 'board' ? (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <KanbanBoard applications={filteredCandidates} onStatusUpdate={handleStatusUpdate} />
                </div>
            ) : (
                /* List View (Premium Table) */
                filteredCandidates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#cbd5e1', fontSize: '2.5rem' }}><i className="fas fa-search"></i></div>
                        <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.75rem', fontWeight: '800' }}>No candidates found</h3>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Candidate</th>
                                        <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Role Applied For</th>
                                        <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Applied Date</th>
                                        <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                                        <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.map((application, index) => {
                                        const statusStyle = getStatusStyle(application.status);
                                        return (
                                            <tr key={application._id} style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fcfdff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}
                                            >
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                        <div style={{ position: 'relative' }}>
                                                            <img src={application.applicant?.profilePhoto || `https://ui-avatars.com/api/?name=${application.applicant?.name}`} alt="" style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                                                            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', marginBottom: '0.25rem' }}>{application.applicant?.name}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{application.applicant?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <div style={{ fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>{application.job?.title}</div>
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem', color: '#64748b' }}>
                                                    {new Date(application.appliedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <span style={{
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '99px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        background: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        border: `1px solid ${statusStyle.border}`,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {application.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button onClick={() => setSelectedCandidate(application)} className="btn-icon-hover"
                                                            style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; }}
                                                            title="View Profile">
                                                            <i className="fas fa-eye"></i>
                                                        </button>

                                                        {application.status === 'Pending' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm('Accept this candidate?')) handleStatusUpdate(application._id, 'Accepted');
                                                                }}
                                                                style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1fae5', background: '#ecfdf5', color: '#059669', cursor: 'pointer' }}
                                                                title="Accept"
                                                            >
                                                                <i className="fas fa-check"></i>
                                                            </button>
                                                        )}

                                                        <button onClick={() => {
                                                            setActionCandidate({ id: application.applicant?._id, name: application.applicant?.name, applicant: application.applicant, jobId: application.job?._id, applicationId: application._id });
                                                            setShowScheduleModal(true);
                                                        }} style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e7ff', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = 'white'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }}
                                                            title="Schedule Interview">
                                                            <i className="fas fa-calendar-alt"></i>
                                                        </button>

                                                        <button onClick={() => {
                                                            setActionCandidate({ id: application.applicant?._id, name: application.applicant?.name, applicant: application.applicant, jobId: application.job?._id, applicationId: application._id });
                                                            setShowMessageModal(true);
                                                        }} style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0f2fe', background: '#f0f9ff', color: '#0ea5e9', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#0ea5e9'; e.currentTarget.style.color = 'white'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0ea5e9'; }}
                                                            title="Send Message">
                                                            <i className="fas fa-envelope"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}

            {selectedCandidate && <ProfileModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />}
        </div>
    );
};

/**
 * Enhanced Import & Certificate Tab
 * Features: Excel Upload, Manual Entry, Certificate Generation
 */
const ImportCertTab = ({ addToast }) => {
    const [uploadMode, setUploadMode] = useState('excel'); // 'excel' or 'manual'
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [report, setReport] = useState(null);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Manual Entry State
    const [manualForm, setManualForm] = useState({
        name: '',
        email: '',
        course: '',
        year: new Date().getFullYear(),
        grade: 'A'
    });

    // Fetch students
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const res = await api.get('/students');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus('idle');
        setReport(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/students/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReport(res.data);
            setStatus('success');
            fetchStudents();
        } catch (err) {
            console.error(err);
            setStatus('error');
            setReport({ message: err.response?.data?.message || 'Upload failed' });
        }
    };

    const handleManualChange = (e) => {
        setManualForm({ ...manualForm, [e.target.name]: e.target.value });
    };

    const handleManualAdd = async () => {
        if (!manualForm.name || !manualForm.email || !manualForm.course) {
            addToast('Please fill in Name, Email and Course', 'error');
            return;
        }

        try {
            const res = await api.post('/students/create', manualForm);
            if (res.data.success) {
                setStudents([res.data.data, ...students]);
                setManualForm({ name: '', email: '', course: '', year: new Date().getFullYear(), grade: 'A' });
                addToast('Student added successfully!', 'success');
            }
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to add student', 'error');
        }
    };

    const handleDelete = async (studentId) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await api.delete(`/students/${studentId}`);
            setStudents(students.filter(s => s._id !== studentId));
            addToast('Student deleted successfully', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to delete student', 'error');
        }
    };

    const handleGenerate = async (studentId) => {
        if (!window.confirm('Generate certificate for this student?')) return;
        try {
            // Check if mock ID
            if (studentId.toString().startsWith('temp_')) {
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, status: 'Generated', certificateId: 'mock_cert_id' } : s));
                addToast('Certificate generated! (Mock)', 'success');
                return;
            }

            const res = await api.post(`/cert/generate/${studentId}`);
            if (res.data.success) {
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, status: 'Generated', pdfUrl: res.data.data.pdfUrl, certificateId: res.data.data.certificateId } : s));
                addToast('Success: Certificate generated and sent to student!', 'success');
            } else {
                addToast(res.data.message || 'Server reported failure to generate certificate.', 'error');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Failed to generate certificate';
            addToast(`Error: ${msg}`, 'error');
        }
    };

    const generateIndianDummyData = () => {
        const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Neel", "Siddharth", "Shiv", "Kabir", "Rohan", "Rahul", "Raj", "Amit", "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Anika", "Navya", "Angel", "Myra", "Sara", "Kavya", "Jhanvi", "Riya", "Sneha", "Pooja", "Neha", "Priya", "Divya", "Isha", "Shruti"];
        const lastNames = ["Patel", "Sharma", "Singh", "Kumar", "Gupta", "Yadav", "Das", "Chopra", "Reddy", "Rao", "Nair", "Kapoor", "Khan", "Jain", "Mehta", "Mishra", "Pandey", "Verma", "Bhat", "Saxena"];
        const courses = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "BBA", "MBA"];

        const data = [];
        for (let i = 0; i < 120; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(100 + Math.random() * 900)}@example.com`;

            data.push({
                "Name": name,
                "Email": email,
                "RollNo": `RN${2024 + Math.floor(Math.random() * 2)}${Math.floor(1000 + Math.random() * 9000)}`,
                "Course": courses[Math.floor(Math.random() * courses.length)],
                "Year": 2024 + Math.floor(Math.random() * 2), // 2024 or 2025
                "Grade": ["A", "A+", "B", "O"][Math.floor(Math.random() * 4)]
            });
        }
        return data;
    };

    const handleDownloadTemplate = (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const data = generateIndianDummyData();
            const ws = XLSX.utils.json_to_sheet(data);

            // Force "Year" column (Column E) to be Text type to prevent validation error
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                // Column 4 is 'E' (0-indexed: A=0, B=1, C=2, D=3, E=4)
                const ref = XLSX.utils.encode_cell({ r: R, c: 4 });
                if (!ws[ref]) continue;
                if (R === 0) continue; // Skip header
                ws[ref].t = 's'; // Force string type
                ws[ref].v = String(ws[ref].v); // Ensure value is string
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Students");
            XLSX.writeFile(wb, "Student_Upload_Template_v4.xlsx");
        } catch (err) {
            console.error("Template generation failed", err);
            addToast("Failed to generate template. Please try again.", 'error');
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Certificate <span style={{ color: '#6366f1' }}>Management</span></h2>
                    <p style={{ color: 'var(--color-gray)', marginTop: '0.5rem' }}>Import student data and generate certificates in bulk.</p>
                </div>
                <div style={{ background: '#f1f5f9', padding: '0.4rem', borderRadius: '12px', display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleDownloadTemplate}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            backgroundColor: 'white',
                            color: 'var(--color-primary)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <i className="fas fa-download"></i> Template
                    </button>
                    <button
                        onClick={() => setUploadMode('excel')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            backgroundColor: uploadMode === 'excel' ? 'white' : 'transparent',
                            color: uploadMode === 'excel' ? 'var(--color-primary)' : 'var(--color-gray)',
                            boxShadow: uploadMode === 'excel' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <i className="fas fa-file-excel"></i> Excel Upload
                    </button>
                    <button
                        onClick={() => setUploadMode('manual')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            backgroundColor: uploadMode === 'manual' ? 'white' : 'transparent',
                            color: uploadMode === 'manual' ? 'var(--color-primary)' : 'var(--color-gray)',
                            boxShadow: uploadMode === 'manual' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <i className="fas fa-keyboard"></i> Manual Entry
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
                {/* Input Section */}
                <div className="glass-card" style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '24px', position: 'sticky', top: '20px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    {uploadMode === 'excel' ? (
                        <>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>Upload Excel File</h3>
                            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem', backgroundColor: '#f8fafc', transition: 'all 0.2s', position: 'relative' }}>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                                <div style={{ width: '64px', height: '64px', background: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-primary)', fontSize: '1.8rem' }}>
                                    <i className="fas fa-cloud-upload-alt"></i>
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-dark)' }}>Click to Upload or Drag & Drop</h4>
                                <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--color-gray)' }}>Supports .xlsx and .xls formats</p>
                                {file && <div style={{ marginTop: '1rem', fontWeight: '600', color: 'var(--color-primary)' }}>Selected: {file.name}</div>}
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={!file || status === 'uploading'}
                                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)' }}
                            >
                                {status === 'uploading' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}
                                {status === 'uploading' ? 'Processing...' : 'Upload Data'}
                            </button>

                            {status === 'success' && report && (
                                <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                                    <div style={{ color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-check-circle"></i> Success!
                                    </div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#15803d' }}>
                                        Processed: <b>{report.totalRows}</b> rows<br />
                                        Added: <b>{report.inserted}</b> students
                                    </div>

                                    {/* Detailed Error Report */}
                                    {report.failed > 0 && (
                                        <div style={{ marginTop: '1rem', borderTop: '1px dashed #bbf7d0', paddingTop: '0.5rem' }}>
                                            <div style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                                Failed: {report.failed} records
                                            </div>
                                            <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.8rem', color: '#991b1b', background: '#fef2f2', padding: '0.5rem', borderRadius: '8px' }}>
                                                {report.errors && report.errors.map((err, i) => (
                                                    <div key={i} style={{ marginBottom: '0.25rem', borderBottom: '1px solid #fee2e2', paddingBottom: '0.25rem' }}>
                                                        <b>Row {err.row}:</b> {err.reason}
                                                        {err.data && err.data.Name && <span> ({err.data.Name})</span>}
                                                    </div>
                                                ))}
                                                {(!report.errors || report.errors.length === 0) && <div>Check server logs for details.</div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>Manual Student Entry</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>Full Name</label>
                                    <input type="text" name="name" value={manualForm.name} onChange={handleManualChange} placeholder="e.g. John Doe" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', background: '#f8fafc' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>Email Address</label>
                                    <input type="email" name="email" value={manualForm.email} onChange={handleManualChange} placeholder="john@example.com" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', background: '#f8fafc' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>Course</label>
                                        <input type="text" name="course" value={manualForm.course} onChange={handleManualChange} placeholder="e.g. B.Tech" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', background: '#f8fafc' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>Year</label>
                                        <input type="number" name="year" value={manualForm.year} onChange={handleManualChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', background: '#f8fafc' }} />
                                    </div>
                                </div>

                                <button
                                    onClick={handleManualAdd}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)'
                                    }}
                                >
                                    <i className="fas fa-plus"></i> Add Student
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* List Section */}
                <div className="glass-card" style={{ padding: '0', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Student Records</h3>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-gray)', fontWeight: '600' }}>
                            Total: {students.length}
                        </div>
                    </div>

                    <div style={{ padding: '0' }}>
                        {loadingStudents ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-gray)' }}>
                                <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: '1rem', color: 'var(--color-primary-soft)' }}></i>
                                <p>Loading records...</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700', color: 'var(--color-gray-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Student</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700', color: 'var(--color-gray-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Details</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700', color: 'var(--color-gray-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Certificate</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', color: 'var(--color-gray-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, index) => (
                                            <tr key={student._id} style={{ borderBottom: index !== students.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fefefe'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <div style={{ fontWeight: '700', color: 'var(--color-dark)' }}>{student.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>{student.email || student.rollNumber || 'No Email'}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <div style={{ color: 'var(--color-dark-muted)', fontWeight: '500' }}>{student.course}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>Year: {student.year}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                        padding: '0.3rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700',
                                                        backgroundColor: student.status === 'Generated' ? '#ecfdf5' : '#fff7ed',
                                                        color: student.status === 'Generated' ? '#059669' : '#ea580c',
                                                        border: `1px solid ${student.status === 'Generated' ? '#a7f3d0' : '#fed7aa'}`,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {student.status === 'Generated' ? <i className="fas fa-check-circle"></i> : <i className="fas fa-clock"></i>}
                                                        {student.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        {student.status === 'Generated' && student.certificateId ? (
                                                            <a
                                                                href={`${api.defaults.baseURL}/cert/download/${student.certificateId}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn-icon-hover"
                                                                style={{
                                                                    textDecoration: 'none',
                                                                    color: 'var(--color-primary)',
                                                                    fontWeight: '600',
                                                                    width: '36px', height: '36px', borderRadius: '10px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    border: '1px solid #e2e8f0',
                                                                    background: 'white'
                                                                }}
                                                                title="Download PDF"
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </a>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleGenerate(student._id)}
                                                                className="btn-icon-hover"
                                                                style={{
                                                                    padding: '0 0.8rem',
                                                                    height: '36px',
                                                                    borderRadius: '10px',
                                                                    border: 'none',
                                                                    background: 'var(--color-primary-soft)',
                                                                    color: 'white',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '600',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.3rem',
                                                                    boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                                                                }}
                                                            >
                                                                <i className="fas fa-wand-magic-sparkles"></i> Generate
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(student._id)}
                                                            className="btn-icon-hover"
                                                            style={{
                                                                width: '36px', height: '36px',
                                                                borderRadius: '10px',
                                                                border: '1px solid #fee2e2',
                                                                background: '#fff1f2',
                                                                color: '#dc2626',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Delete Student"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                                                    <div style={{ color: 'var(--color-gray-lighter)', fontSize: '3rem', marginBottom: '1rem' }}><i className="fas fa-clipboard-list"></i></div>
                                                    <h4 style={{ color: 'var(--color-dark)', margin: '0 0 0.5rem 0' }}>No Records Found</h4>
                                                    <p style={{ color: 'var(--color-gray)', margin: 0 }}>Start by uploading a file or adding a student manually.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Generated Certificates Showcase */}
            {students.some(s => s.status === 'Generated') && (
                <div style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-dark)' }}>Generated Certificates</h3>
                        <div style={{ height: '1px', background: 'var(--color-border)', flex: 1 }}></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {students.filter(s => s.status === 'Generated').map((student) => (
                            <div key={`cert-${student._id}`} className="glass-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #ca8a04, #facc15)' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef9c3', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                        <i className="fas fa-award"></i>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ca8a04', background: '#fef9c3', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>VERIFIED</span>
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--color-dark)' }}>{student.name}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', marginBottom: '1rem' }}>{student.course}</p>

                                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--color-dark-muted)', marginBottom: '1rem', border: '1px dashed var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <span style={{ color: 'var(--color-gray)' }}>ID:</span>
                                        <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>{student.certificateId?.slice(-8).toUpperCase() || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-gray)' }}>Date:</span>
                                        <span style={{ fontWeight: '600' }}>{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <a
                                    href={`${api.defaults.baseURL}/cert/download/${student.certificateId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'var(--color-dark)',
                                        borderColor: 'var(--color-dark)'
                                    }}
                                >
                                    <i className="fas fa-download"></i> Download Cert
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Checkout Form Component inside Modal
const CheckoutForm = ({ plan, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) return;

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: `${window.location.origin}/dashboard-employer` },
            redirect: 'if_required'
        });

        if (stripeError) {
            setError(stripeError.message);
            setLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            await api.post('/payment/verify', { plan: plan.name, paymentIntentId: paymentIntent.id });
            addToast('Payment Successful!', 'success');
            onClose();
            window.location.reload();
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ minWidth: '350px' }}>
            <div style={{ marginBottom: '1rem' }}><PaymentElement /></div>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            <button type="submit" disabled={!stripe || loading} className="btn btn-primary" style={{ width: '100%' }}>{loading ? 'Processing...' : `Pay ${plan.price}`}</button>
        </form>
    );
};

// Mock Checkout Form for Demo/Test Mode
const MockCheckoutForm = ({ plan, onClose }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        setTimeout(async () => {
            await api.post('/payment/verify', { plan: plan.name, paymentIntentId: `mock_${Date.now()}` });
            addToast('Payment Successful (Mock)!', 'success');
            onClose();
            window.location.reload();
        }, 1000);
    };
    return (
        <form onSubmit={handleSubmit}>
            <p>Mock Payment Mode Enabled.</p>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Pay {plan.price} (Mock)</button>
        </form>
    );
};

// Subscription Plans Component
function SubscriptionPlans({ onClose }) {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [isMock, setIsMock] = useState(false);
    const plans = [
        { name: 'Basic', price: '₹50', amount: 50, features: ['5 Jobs', 'Basic Search'], color: '#64748b' },
        { name: 'Premium', price: '₹200', amount: 200, features: ['15 Jobs', 'Adv Search', 'Badge'], color: 'var(--color-primary-soft)', recommend: true },
        { name: 'Pro', price: '₹800', amount: 800, features: ['Unlimited', 'Full Access'], color: '#0f172a' }
    ];

    const handleSelectPlan = async (plan) => {
        try {
            const { data } = await api.post('/payment/create-payment-intent', { plan: plan.name, amount: plan.amount });
            setIsMock(data.isMock);
            setClientSecret(data.clientSecret || 'mock_secret');
            setSelectedPlan(plan);
        } catch (err) {
            console.error(err);
            addToast('Failed to init payment', 'error');
        }
    };

    return (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 2000 }}>
            <div className="modal-content" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', maxWidth: '900px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>

                {!selectedPlan ? (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '2rem' }}>Choose Your Plan</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            {plans.map(plan => (
                                <div key={plan.name} style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: plan.recommend ? `2px solid ${plan.color}` : '1px solid #e2e8f0', transform: plan.recommend ? 'scale(1.05)' : 'none' }}>
                                    <h3>{plan.name}</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: plan.color, marginBottom: '1rem' }}>{plan.price}</div>
                                    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
                                        {plan.features.map((f, i) => <li key={i} style={{ marginBottom: '0.5rem' }}><i className="fas fa-check" style={{ color: 'green', marginRight: '0.5rem' }}></i> {f}</li>)}
                                    </ul>
                                    <button onClick={() => handleSelectPlan(plan)} className="btn btn-primary" style={{ width: '100%', background: plan.color }}>Choose {plan.name}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <button onClick={() => setSelectedPlan(null)} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: 'var(--color-primary-soft)', cursor: 'pointer' }}>&larr; Back to Plans</button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Checkout: {selectedPlan.name}</h3>
                        {clientSecret && <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            {isMock ? <MockCheckoutForm plan={selectedPlan} onClose={onClose} /> : <CheckoutForm plan={selectedPlan} onClose={onClose} />}
                        </Elements>}
                    </div>
                )}
            </div>
        </div>
    );
}

function SettingsTab({ user, setUser }) {
    const [showPlans, setShowPlans] = useState(false);
    const [activeSection, setActiveSection] = useState('profile'); // profile, notifications, billing, security
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    // Photo Upload State
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Company Profile State
    const [companyData, setCompanyData] = useState({
        companyName: '',
        companyWebsite: '',
        companyDescription: '',
        location: '',
        industry: '',
        companySize: ''
    });

    useEffect(() => {
        if (user) {
            setCompanyData({
                companyName: user.companyName || '',
                companyWebsite: user.companyWebsite || '',
                companyDescription: user.companyDescription || '',
                location: user.location || '',
                industry: user.industry || '',
                companySize: user.companySize || ''
            });
            // Initialize preview with existing photo
            if (user.profilePhoto) {
                setPhotoPreview(user.profilePhoto);
            }
        }
    }, [user]);

    const handleCompanyChange = (e) => {
        const { name, value } = e.target;
        setCompanyData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCompany = async () => {
        setLoading(true);
        setAlert(null);
        try {
            const formData = new FormData();
            // Append all text fields
            Object.keys(companyData).forEach(key => {
                formData.append(key, companyData[key]);
            });
            // Append photo if selected
            if (photoFile) {
                formData.append('profilePhoto', photoFile);
            }

            const res = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setAlert({ type: 'success', message: 'Company profile updated successfully!' });
                setUser(res.data.data);
            } else {
                setAlert({ type: 'error', message: res.data.error || 'Failed to update.' });
            }
        } catch (error) {
            console.error("Update error:", error);
            setAlert({ type: 'error', message: 'An error occurred.' });
        } finally {
            setLoading(false);
            setTimeout(() => setAlert(null), 3000);
        }
    };

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        candidateUpdates: true,
        marketing: false
    });

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const sections = [
        { id: 'profile', icon: 'fas fa-building', label: 'Company Profile' },
        { id: 'notifications', icon: 'fas fa-bell', label: 'Notifications' },
        { id: 'billing', icon: 'fas fa-credit-card', label: 'Plan & Billing' },
        { id: 'security', icon: 'fas fa-shield-alt', label: 'Security' }
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '0 2rem', display: 'flex', gap: '2rem', alignItems: 'start' }}>
            {/* Sidebar Navigation */}
            <div className="glass-card" style={{ width: '280px', padding: '1.5rem', background: 'white', borderRadius: '20px', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                <h3 style={{ margin: '0 0 1.5rem 1rem', fontSize: '1.25rem', fontWeight: '800' }}>Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeSection === section.id ? 'var(--color-primary-light)' : 'transparent',
                                color: activeSection === section.id ? 'var(--color-primary)' : 'var(--color-gray)',
                                fontWeight: activeSection === section.id ? '700' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                fontSize: '0.95rem'
                            }}
                        >
                            <i className={section.icon} style={{ width: '20px', textAlign: 'center' }}></i>
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {alert && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: alert.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: alert.type === 'success' ? '#166534' : '#991b1b',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        animation: 'fadeIn 0.3s'
                    }}>
                        <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                        {alert.message}
                    </div>
                )}

                {/* Profile Section */}
                {activeSection === 'profile' && (
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                        <style>{`
                            .profile-card-container {
                                background: white;
                                border-radius: 12px;
                                overflow: hidden;
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                                margin-bottom: 2rem;
                                font-family: 'Plus Jakarta Sans', sans-serif;
                                border: 1px solid #e2e8f0;
                            }
                            .profile-banner {
                                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                                height: 140px;
                                width: 100%;
                            }
                            .profile-body {
                                padding: 0 2rem 2rem 2rem;
                                position: relative;
                            }
                            .profile-avatar-wrapper {
                                margin-top: -60px;
                                margin-bottom: 1rem;
                                position: relative;
                                z-index: 10;
                                display: inline-block;
                                padding: 4px;
                                background: white;
                                border-radius: 50%;
                            }
                            .profile-avatar {
                                width: 120px;
                                height: 120px;
                                border-radius: 50%;
                                object-fit: cover;
                                border: 4px solid white; 
                            }
                            .profile-name {
                                font-size: 1.8rem;
                                font-weight: 700;
                                color: #1e293b;
                                margin: 0;
                                line-height: 1.2;
                            }
                            .profile-headline {
                                color: #3b82f6;
                                font-size: 1.1rem;
                                font-weight: 600;
                                margin: 0.25rem 0 1rem 0;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            }
                            .profile-contact {
                                color: #64748b;
                                font-size: 0.95rem;
                                margin-bottom: 1.5rem;
                            }
                            .social-icons-row {
                                display: flex;
                                gap: 1.5rem;
                                margin-bottom: 2rem;
                                font-size: 1.2rem;
                                color: #64748b;
                            }
                            .skills-badges {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 0.75rem;
                            }
                            .skill-badge {
                                background: #eff6ff;
                                color: #3b82f6;
                                padding: 0.5rem 1.25rem;
                                borderRadius: 50px;
                                font-size: 0.9rem;
                                font-weight: 600;
                            }
                        `}</style>

                        {/* Company Profile Card Display */}
                        <div className="profile-card-container">
                            <div className="profile-banner"></div>
                            <div className="profile-body">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="profile-avatar-wrapper">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Company Logo" className="profile-avatar" />
                                            ) : (
                                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#cbd5e1' }}>
                                                    <i className="fas fa-building"></i>
                                                </div>
                                            )}
                                        </div>
                                        <h1 className="profile-name">{companyData.companyName || 'Company Name'}</h1>
                                        <p className="profile-headline">{companyData.industry || 'INDUSTRY SECTOR'}</p>
                                        <p className="profile-contact">
                                            {companyData.location || 'Location, Country'} | {companyData.companyWebsite || 'website.com'}
                                        </p>

                                        <div className="social-icons-row">
                                            <i className="fas fa-globe"></i>
                                            <i className="fab fa-linkedin"></i>
                                            <i className="fab fa-twitter"></i>
                                        </div>

                                        <div className="profile-skills-section">
                                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>Company Details</h4>
                                            <div className="skills-badges">
                                                {companyData.companySize && <span className="skill-badge">{companyData.companySize}</span>}
                                                {companyData.industry && <span className="skill-badge">{companyData.industry}</span>}
                                                <span className="skill-badge">Active Employer</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Edit Company Profile</h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f8fafc', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '2rem', position: 'relative', overflow: 'hidden' }}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <i className="fas fa-image"></i>
                                )}
                                <label style={{ position: 'absolute', bottom: '0', right: '0', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fas fa-camera" style={{ fontSize: '0.8rem' }}></i>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                                </label>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Company Logo</h4>
                                <p style={{ margin: 0, color: 'var(--color-gray)', fontSize: '0.9rem' }}>Upload a high-res logo (400x400px)</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={companyData.companyName}
                                    onChange={handleCompanyChange}
                                    placeholder="e.g. Acme Corp"
                                    className="form-control"
                                    style={{ background: '#f8fafc' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>Official Website</label>
                                <input
                                    type="text"
                                    name="companyWebsite"
                                    value={companyData.companyWebsite}
                                    onChange={handleCompanyChange}
                                    placeholder="https://example.com"
                                    className="form-control"
                                    style={{ background: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>Industry</label>
                                <select
                                    name="industry"
                                    value={companyData.industry}
                                    onChange={handleCompanyChange}
                                    className="form-control"
                                    style={{ background: 'white' }}
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>Company Size</label>
                                <select
                                    name="companySize"
                                    value={companyData.companySize}
                                    onChange={handleCompanyChange}
                                    className="form-control"
                                    style={{ background: 'white' }}
                                >
                                    <option value="">Select Size</option>
                                    <option value="1-10">1-10 Employees</option>
                                    <option value="11-50">11-50 Employees</option>
                                    <option value="51-200">51-200 Employees</option>
                                    <option value="201-500">201-500 Employees</option>
                                    <option value="500+">500+ Employees</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={companyData.location}
                                    onChange={handleCompanyChange}
                                    placeholder="Headquarters Location"
                                    className="form-control"
                                    style={{ background: 'white' }}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>About Company</label>
                                <textarea
                                    name="companyDescription"
                                    rows="4"
                                    value={companyData.companyDescription}
                                    onChange={handleCompanyChange}
                                    placeholder="Brief description of your company..."
                                    className="form-control"
                                    style={{ background: 'white', resize: 'vertical' }}
                                ></textarea>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveCompany}
                                disabled={loading}
                                style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Notification Preferences</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-dark)' }}>Email Alerts</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-gray)' }}>Receive emails when candidates apply.</p>
                                </div>
                                <div
                                    onClick={() => toggleNotification('emailAlerts')}
                                    style={{ width: '48px', height: '24px', background: notifications.emailAlerts ? 'var(--color-primary)' : '#e2e8f0', borderRadius: '50px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                                >
                                    <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: notifications.emailAlerts ? '26px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-dark)' }}>Candidate Updates</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-gray)' }}>Get notified when a candidate accepts an interview.</p>
                                </div>
                                <div
                                    onClick={() => toggleNotification('candidateUpdates')}
                                    style={{ width: '48px', height: '24px', background: notifications.candidateUpdates ? 'var(--color-primary)' : '#e2e8f0', borderRadius: '50px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                                >
                                    <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: notifications.candidateUpdates ? '26px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Billing Section */}
                {activeSection === 'billing' && (
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Plan & Billing</h2>

                        <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', borderRadius: '20px', marginBottom: '2rem', border: '1px solid #dbeafe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#4338ca', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Plan</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#312e81', lineHeight: '1' }}>Free Trial</div>
                                <p style={{ color: '#4f46e5', marginTop: '0.5rem', fontWeight: '500' }}>Your plan expires in 14 days.</p>
                            </div>
                            <button onClick={() => setShowPlans(true)} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>Upgrade Pro</button>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Payment History</h3>
                        <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: '16px', color: 'var(--color-gray)' }}>
                            No payment history available
                        </div>
                    </div>
                )}

                {/* Security Section (Mock) */}
                {activeSection === 'security' && (
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Security</h2>
                        <button className="btn" style={{ border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}>Change Password</button>
                    </div>
                )}

            </div>
            {showPlans && <SubscriptionPlans onClose={() => setShowPlans(false)} />}

        </div>
    );
}

export default DashboardEmployer;
