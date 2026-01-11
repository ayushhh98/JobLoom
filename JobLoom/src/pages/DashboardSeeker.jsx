import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import api from '../services/api';
import SeekerMessagesTab from '../components/SeekerMessagesTab';

const DashboardSeeker = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); // Use context
    // const [user, setUser] = useState(null); // Removed local state
    const [recentActivity, setRecentActivity] = useState([]);

    const [profileStrength, setProfileStrength] = useState(85);
    const [totalApplications, setTotalApplications] = useState(0);
    const [dataLoading, setDataLoading] = useState(true); // Renamed to avoid conflict
    const [activeTab, setActiveTab] = useState('dashboard');

    // Mock Data for "Recommended Jobs"
    const recommendedJobs = [
        { id: 1, title: 'Senior Frontend Engineer', company: 'TechFlow', location: 'Remote', salary: '$120k - $150k', type: 'Full-time', logo: 'T' },
        { id: 2, title: 'Product Designer', company: 'Creative Os', location: 'New York, NY', salary: '$90k - $110k', type: 'Contract', logo: 'C' },
        { id: 3, title: 'Backend Developer', company: 'DevSystems', location: 'Austin, TX', salary: '$110k - $135k', type: 'Full-time', logo: 'D' },
    ];

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            console.warn("DashboardSeeker: No user found. Redirecting to login...");
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            // User is available from context
            try {
                const activityRes = await api.get('/jobs/applied');
                if (activityRes.data.success && Array.isArray(activityRes.data.data)) {
                    setRecentActivity(activityRes.data.data.slice(0, 3));
                    setTotalApplications(activityRes.data.data.length);
                }
            } catch (err) {
                console.error('Failed to load dashboard data', err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, authLoading, navigate]);



    const upcomingInterviews = [];

    if (authLoading || dataLoading) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '3rem', color: 'var(--color-primary)' }}></i>
                    <p style={{ color: 'var(--color-gray)', fontWeight: 500 }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="page-content" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>


            <div className="container" style={{ paddingTop: '2rem' }}>
                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        style={{
                            padding: '1rem 0.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'dashboard' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: activeTab === 'dashboard' ? 'var(--color-primary)' : 'var(--color-gray)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        style={{
                            padding: '1rem 0.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'messages' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: activeTab === 'messages' ? 'var(--color-primary)' : 'var(--color-gray)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Messages
                    </button>
                </div>

                {activeTab === 'messages' ? (
                    <SeekerMessagesTab />
                ) : (
                    <>
                        {/* Hero / Welcome Section */}
                        <div className="reveal active" style={{ marginBottom: '2.5rem' }}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                                Welcome back, <span className="text-primary">{user?.name ? user.name.split(' ')[0] : 'User'}</span> 👋
                            </h1>
                            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Here are your recommended potential jobs.</p>
                        </div>

                        {/* Stats Row */}
                        <div className="grid-3 reveal active" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div className="glass-card hover-lift" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Profile Views</p>
                                    <i className="fas fa-eye" style={{ color: '#bfdbfe', fontSize: '1.2rem' }}></i>
                                </div>
                                <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>128</h3>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#16a34a' }}><i className="fas fa-arrow-up"></i> 12% this week</p>
                            </div>
                            <div className="glass-card hover-lift" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Applications</p>
                                    <i className="fas fa-paper-plane" style={{ color: '#ddd6fe', fontSize: '1.2rem' }}></i>
                                </div>
                                <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>{totalApplications}</h3>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Total applied</p>
                            </div>
                            <div className="glass-card hover-lift" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Interviews</p>
                                    <i className="fas fa-calendar-check" style={{ color: '#fde68a', fontSize: '1.2rem' }}></i>
                                </div>
                                <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>{upcomingInterviews.length}</h3>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#f59e0b' }}>Upcoming</p>
                            </div>
                        </div>

                        {/* Dashboard Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem' }}>

                            {/* Main Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                                {/* Attractive Poster / Banner */}
                                <div className="reveal active" style={{
                                    background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
                                    borderRadius: '20px',
                                    padding: '2.5rem',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.4)'
                                }}>
                                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '70%' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', display: 'inline-block' }}>🚀 BOOST YOUR CAREER</span>
                                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.2 }}>Get Verified & Stand Out to Top Employers</h2>
                                        <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.9 }}>Pass the skill assessment to earn a badge and increase your profile visibility by 3x.</p>
                                        <Link to="/network" className="btn" style={{ background: 'white', color: '#4338ca', fontWeight: 700, padding: '0.8rem 2rem', borderRadius: '12px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Start Assessment <i className="fas fa-arrow-right"></i>
                                        </Link>
                                    </div>
                                    {/* Abstract Shapes Decoration */}
                                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                                    <div style={{ position: 'absolute', bottom: '-80px', right: '100px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                                    <i className="fas fa-trophy" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', fontSize: '10rem', color: 'rgba(255,255,255,0.1)' }}></i>
                                </div>

                                {/* Recent Activity Section */}
                                <div className="reveal active">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Recent Activity</h3>
                                        <Link to="/applications" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>View All History</Link>
                                    </div>
                                    <div className="glass-card" style={{ padding: '0', background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
                                        {recentActivity.length === 0 ? (
                                            <div style={{ padding: '3rem', textAlign: 'center' }}>
                                                <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                                    <i className="fas fa-history" style={{ color: '#94a3b8', fontSize: '1.5rem' }}></i>
                                                </div>
                                                <h5 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No recent activity</h5>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>When you apply for jobs, they will appear here.</p>
                                            </div>
                                        ) : (
                                            recentActivity.map((app, index) => {
                                                let statusColor = '#3b82f6';
                                                let statusBg = '#eff6ff';
                                                if (app.status === 'reviewed') { statusColor = '#eab308'; statusBg = '#fef9c3'; }
                                                if (app.status === 'accepted') { statusColor = '#16a34a'; statusBg = '#dcfce7'; }
                                                if (app.status === 'rejected') { statusColor = '#ef4444'; statusBg = '#fee2e2'; }

                                                return (
                                                    <div key={index} style={{ padding: '1.25rem', borderBottom: index !== recentActivity.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }} className="hover-bg-slate">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{ width: '48px', height: '48px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748b', fontWeight: 800 }}>
                                                                {app.job && app.job.employer.companyName ? app.job.employer.companyName.charAt(0) : 'C'}
                                                            </div>
                                                            <div>
                                                                <h5 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{app.job ? app.job.title : 'Job Application'}</h5>
                                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{app.job ? app.job.employer.companyName : 'Tech Company'}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '50px', background: statusBg, color: statusColor, fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                            </span>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(app.appliedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Recommended Jobs Section */}
                                <div className="reveal active">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Recommended For You</h3>
                                        <Link to="/jobs" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Browse All</Link>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {recommendedJobs.map(job => (
                                            <div key={job.id} className="glass-card" style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569' }}>{job.logo}</div>
                                                    <i className="far fa-bookmark" style={{ color: '#94a3b8' }}></i>
                                                </div>
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#1e293b' }}>{job.title}</h4>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{job.company}</p>
                                                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{job.location}</span>
                                                    <span style={{ fontSize: '0.75rem', background: '#ecfccb', color: '#4d7c0f', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{job.salary}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>


                            {/* Sidebar / Right Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* Profile Strength */}
                                <div className="glass-card reveal active" style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '20px' }}>
                                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#1e293b' }}>Profile Strength</h4>
                                    <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem auto' }}>
                                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray={`${profileStrength}, 100`} />
                                        </svg>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', display: 'block' }}>{profileStrength}%</span>
                                        </div>
                                    </div>
                                    <Link to="/profile" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>Complete Profile</Link>
                                </div>

                                {/* Upcoming Interviews */}
                                <div className="glass-card reveal active" style={{ padding: '1.5rem', background: 'white', borderRadius: '20px' }}>
                                    <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#1e293b' }}>Upcoming Interviews</h4>
                                    {upcomingInterviews.length === 0 ? (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0' }}>No interviews scheduled.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {upcomingInterviews.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', width: '50px' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block' }}>{new Date(item.createdAt).getDate()}</span>
                                                        <span style={{ fontSize: '0.7rem' }}>{new Date(item.createdAt).toLocaleString('default', { month: 'short' })}</span>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{item.title}</p>
                                                        <a href="#" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>View Details</a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Skill Gap (Mock) */}
                                <div className="glass-card reveal active" style={{ padding: '1.5rem', background: '#1e293b', borderRadius: '20px', color: 'white' }}>
                                    <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Top Skills Missing</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Based on jobs you viewed.</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem' }}>Typescript</span>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem' }}>Docker</span>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem' }}>GraphQL</span>
                                    </div>
                                    <Link to="/network" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: '#60a5fa', fontSize: '0.9rem' }}>View learning resources</Link>
                                </div>

                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default DashboardSeeker;
