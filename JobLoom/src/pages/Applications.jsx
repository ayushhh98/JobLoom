import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All Statuses');
    const [sort, setSort] = useState('Newest');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ applied: 0, reviewed: 0, interview: 0, saved: 0 });

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await api.get('/jobs/applied');
                if (res.data.success) {
                    const data = res.data.data;
                    setApplications(data);

                    // Calculate stats
                    setStats({
                        applied: data.length,
                        reviewed: data.filter(a => a.status === 'reviewed').length,
                        interview: data.filter(a => a.status === 'interview').length,
                        saved: 0 // Mock or fetch if available
                    });
                }
            } catch (err) {
                console.error("Failed to load applications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const filteredApps = applications.filter(app => {
        const matchesStatus = filter === 'All Statuses' || app.status.toLowerCase() === filter.toLowerCase();
        const matchesSearch = (app.job?.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (app.job?.employer?.companyName?.toLowerCase() || '').includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    }).sort((a, b) => {
        if (sort === 'Newest') return new Date(b.appliedAt) - new Date(a.appliedAt);
        if (sort === 'Oldest') return new Date(a.appliedAt) - new Date(b.appliedAt);
        return 0;
    });

    return (
        <main className="container page-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {/* Header */}
            <div className="reveal active" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: 800 }}>
                    My <span className="text-gradient" style={{ background: 'linear-gradient(to right, var(--color-primary), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Applications</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Track and manage your job application status in one place.</p>
            </div>

            {/* Premium Banner */}
            <div className="glass-card reveal active" style={{ marginBottom: '3rem', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <span style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
                            🚀 Career Tip
                        </span>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'white' }}>Optimize Your Application Rate</h2>
                        <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '600px' }}>
                            Candidates who follow up within 3 days of applying are <strong>2.5x more likely</strong> to get an interview. Check your status regularly!
                        </p>
                    </div>
                </div>
                {/* Decorative Circles */}
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            </div>

            {/* Stats Grid */}
            <div className="reveal active" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card hover-lift" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Applied</p>
                        <i className="fas fa-paper-plane" style={{ color: '#bfdbfe', fontSize: '1.2rem' }}></i>
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>{stats.applied}</h3>
                </div>
                <div className="glass-card hover-lift" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Reviewed</p>
                        <i className="fas fa-eye" style={{ color: '#fde68a', fontSize: '1.2rem' }}></i>
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>{stats.reviewed}</h3>
                </div>
                <div className="glass-card hover-lift" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Interviews</p>
                        <i className="fas fa-video" style={{ color: '#ddd6fe', fontSize: '1.2rem' }}></i>
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>{stats.interview}</h3>
                </div>
                <div className="glass-card hover-lift" style={{ padding: '1.5rem', borderLeft: '4px solid #ec4899' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Saved Jobs</p>
                        <i className="fas fa-bookmark" style={{ color: '#fbcfe8', fontSize: '1.2rem' }}></i>
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>{stats.saved}</h3>
                </div>
            </div>

            {/* Content Area */}
            <div className="glass-card reveal active" style={{ padding: '2rem', minHeight: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="search-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', width: '350px', transition: 'box-shadow 0.2s' }}>
                        <i className="fas fa-search" style={{ color: '#94a3b8', marginRight: '0.75rem' }}></i>
                        <input
                            type="text"
                            placeholder="Search by job or company..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#1e293b', fontSize: '0.95rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Sort:</span>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                style={{ padding: '0.5rem 2rem 0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', cursor: 'pointer', outline: 'none', fontWeight: 500 }}
                            >
                                <option>Newest</option>
                                <option>Oldest</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Filter:</span>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ padding: '0.5rem 2rem 0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', cursor: 'pointer', outline: 'none', fontWeight: 500 }}
                            >
                                <option>All Statuses</option>
                                <option>Applied</option>
                                <option>Reviewed</option>
                                <option>Interview</option>
                                <option>Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ display: 'inline-block', padding: '1.5rem', background: '#f8fafc', borderRadius: '50%', marginBottom: '1rem' }}>
                            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
                        </div>
                        <p style={{ marginTop: '0.5rem', color: '#64748b', fontWeight: 500 }}>Syncing your applications...</p>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <i className="fas fa-file-invoice" style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: 700 }}>No applications found</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>We couldn't find any applications matching your current filters. Try searching for something else or apply to new jobs.</p>
                        <Link to="/jobs" className="btn btn-primary" style={{ padding: '0.9rem 2rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>Find New Opportunities</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {filteredApps.map(app => (
                            <div key={app._id} className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', background: 'white', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                                {/* Mock Match Score - In real app, this would be computed */}
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="fas fa-magic"></i> {Math.floor(Math.random() * (98 - 75) + 75)}% Match
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#475569', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.05)' }}>
                                        {app.job?.employer?.companyName?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{app.job?.title || 'Job Title'}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}><i className="far fa-building" style={{ marginRight: '0.4rem', color: '#94a3b8' }}></i>{app.job?.employer?.companyName || 'Company'}</span>
                                            <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                                            <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}><i className="fas fa-map-marker-alt" style={{ marginRight: '0.4rem', color: '#94a3b8' }}></i>{app.job?.location || 'Remote'}</span>
                                            <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.6rem', borderRadius: '50px' }}>{app.job?.type || 'Full-time'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', paddingTop: '1rem' }}>
                                    {/* Status Timeline Indicator */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.4rem 1rem',
                                            borderRadius: '50px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            background: app.status === 'interview' ? '#dbeafe' : app.status === 'rejected' ? '#fee2e2' : app.status === 'accepted' ? '#dcfce7' : '#f1f5f9',
                                            color: app.status === 'interview' ? '#1e40af' : app.status === 'rejected' ? '#991b1b' : app.status === 'accepted' ? '#166534' : '#475569',
                                            marginBottom: '0.25rem',
                                        }}>
                                            {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Applied'}
                                        </span>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                                    </div>

                                    <button className="btn btn-outline" style={{ borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderColor: '#e2e8f0', color: '#64748b' }}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Applications;
