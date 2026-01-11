import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const Jobs = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        type: []
    });
    const [salary, setSalary] = useState(0);
    const [experience, setExperience] = useState([]);
    const [searchSource, setSearchSource] = useState('local'); // 'local', 'jooble', 'theirstack'

    const [resultsCount, setResultsCount] = useState(0);

    // Initialize from URL params
    useEffect(() => {
        const keyword = searchParams.get('keyword');
        const location = searchParams.get('location');
        const source = searchParams.get('source');

        if (keyword || location) {
            setFilters(prev => ({
                ...prev,
                keyword: keyword || '',
                location: location || ''
            }));
        }
        if (source && ['local', 'jooble', 'theirstack'].includes(source)) {
            setSearchSource(source);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchJobs();
    }, [searchSource]); // Re-fetch when source changes

    const fetchJobs = async () => {
        setLoading(true);
        setError('');
        try {
            let allJobs = [];

            if (searchSource === 'local') {
                const params = new URLSearchParams();
                if (filters.keyword) params.append('keyword', filters.keyword);
                if (filters.location) params.append('location', filters.location);
                if (filters.type.length > 0) params.append('jobType', filters.type.join(','));
                if (experience.length > 0) params.append('experience', experience.join(','));
                if (salary > 0) params.append('salary', salary);

                const res = await api.get(`/jobs?${params.toString()}`);
                if (res.data.success) {
                    allJobs = res.data.data.map(job => ({ ...job, isExternal: false }));
                }
            } else if (searchSource === 'jooble') {
                const res = await api.post('/jobs/external', {
                    keywords: filters.keyword || 'it',
                    location: filters.location || 'India'
                });
                if (res.data.success && Array.isArray(res.data.data)) {
                    allJobs = res.data.data.map(job => ({
                        _id: job.id,
                        title: job.title,
                        employer: { companyName: job.company },
                        location: job.location,
                        salaryRange: job.salary || 'Not disclosed',
                        jobType: 'Jooble',
                        isExternal: true,
                        link: job.link,
                        snippet: job.snippet
                    }));
                }
            } else if (searchSource === 'theirstack') {
                const res = await api.post('/jobs/external/theirstack', {
                    keywords: filters.keyword,
                    location: filters.location,
                    page: 0
                });
                if (res.data.success && res.data.data && Array.isArray(res.data.data.data)) {
                    allJobs = res.data.data.data.map(job => ({
                        _id: job.job_id || Math.random().toString(),
                        title: job.job_title,
                        employer: { companyName: job.company_object ? job.company_object.name : 'Unknown Company' },
                        location: job.job_location || job.job_country_code || 'Remote',
                        salaryRange: 'Not disclosed',
                        jobType: 'Global',
                        isExternal: true,
                        link: job.url,
                        snippet: job.job_description ? job.job_description.substring(0, 150) + '...' : ''
                    }));
                }
            }

            setJobs(allJobs);
            setResultsCount(allJobs.length);
        } catch (err) {
            console.error(err);
            // Handle specific 503 error for unconfigured services
            if (err.response && err.response.status === 503) {
                setError(`The ${searchSource === 'jooble' ? 'Jooble' : 'Global Search'} service is not currently configured.`);
            } else {
                setError('Failed to load jobs. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    // ... handleCheckboxChange ...

    return (
        <div className="container page-content">
            <div className="welcome-section reveal">
                <h2>Find Your Next <span className="text-primary">Opportunity</span></h2>
                <p>Browse thousands of job openings tailored to your skills.</p>
            </div>

            <div className="search-bar-container reveal">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${searchSource === 'local' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSearchSource('local')}
                        style={{ minWidth: '130px' }}
                    >
                        Internal Jobs
                    </button>
                    <button
                        className={`btn ${searchSource === 'jooble' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSearchSource('jooble')}
                        style={{ minWidth: '130px' }}
                    >
                        Jooble Jobs
                    </button>
                    <button
                        className={`btn ${searchSource === 'theirstack' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSearchSource('theirstack')}
                        style={{ minWidth: '130px' }}
                    >
                        Global Search
                    </button>
                </div>
                <div className="professional-search-card">
                    <form onSubmit={handleSearch} className="search-form-grid">
                        <div className="search-input-modern-group">
                            <i className="fas fa-search search-icon-modern search-icon-primary"></i>
                            <input
                                type="text"
                                className="search-input-modern"
                                placeholder="Job title, keywords, or company"
                                value={filters.keyword}
                                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                            />
                        </div>
                        <div className="search-input-modern-group">
                            <i className="fas fa-map-marker-alt search-icon-modern search-icon-danger"></i>
                            <input
                                type="text"
                                className="search-input-modern"
                                placeholder="City, state, or 'Remote'"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-search-modern">
                            <i className="fas fa-search"></i> Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="job-listing-layout">
                {/* Sidebar Filters */}
                <aside className="job-filters reveal">
                    <div className="glass-card">
                        <h4>Filters</h4>
                        <hr className="divider" style={{ marginBottom: '1.5rem', border: 'none', borderTop: '1px solid var(--color-border)' }} />

                        <div className="filter-group">
                            <h5>Job Type</h5>
                            {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                                <label key={type}>
                                    <input
                                        type="checkbox"
                                        value={type}
                                        checked={filters.type.includes(type)}
                                        onChange={(e) => handleCheckboxChange(e, (newType) => setFilters({ ...filters, type: newType }), filters.type)}
                                    /> {type}
                                </label>
                            ))}
                        </div>

                        <div className="filter-group">
                            <h5>Experience Level</h5>
                            {['Entry Level', 'Mid Level', 'Senior Level'].map(level => (
                                <label key={level}>
                                    <input
                                        type="checkbox"
                                        value={level}
                                        checked={experience.includes(level)}
                                        onChange={(e) => handleCheckboxChange(e, setExperience, experience)}
                                    /> {level}
                                </label>
                            ))}
                        </div>

                        <div className="filter-group">
                            <h5>Minimum Salary</h5>
                            <input
                                type="range"
                                className="form-control"
                                min="0"
                                max="200000"
                                step="5000"
                                value={salary}
                                style={{ padding: 0, height: 'auto' }}
                                onChange={(e) => setSalary(Number(e.target.value))}
                            />
                            <p className="range-display" style={{ fontSize: '0.85rem', color: 'var(--color-gray)', marginTop: '0.5rem' }}>${salary}+</p>
                        </div>

                        <button onClick={fetchJobs} className="btn btn-outline btn-full" style={{ width: '100%' }}>Apply Filters</button>
                    </div>
                </aside>

                {/* Job Results */}
                <div className="job-results reveal">
                    <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ margin: 0 }}>{resultsCount} Jobs Found</h4>
                        <select className="form-control" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                            <option>Sort by: Newest</option>
                            <option>Sort by: Salary</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--gray)', padding: '3rem' }}>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
                            <p style={{ marginTop: '1rem' }}>Loading jobs...</p>
                        </div>
                    ) : error ? (
                        <p style={{ textAlign: 'center', color: '#ef4444' }}>{error}</p>
                    ) : jobs.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                            <i className="fas fa-search" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1.5rem' }}></i>
                            <h3 style={{ color: 'var(--color-gray)' }}>No jobs found</h3>
                            <p style={{ color: '#94a3b8' }}>Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <div className="job-list">
                            {jobs.map((job) => {
                                const companyInitial = job.employer && job.employer.companyName ? job.employer.companyName[0].toUpperCase() : 'H';

                                return (
                                    <div className="job-card-premium" key={job._id}>
                                        <div className="job-header-premium">
                                            <div className="company-logo-premium" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                                {companyInitial}
                                            </div>
                                            <div className="job-info-premium">
                                                <h3>{job.title}</h3>
                                                <div className="company-name-premium">{job.employer ? job.employer.companyName : 'Confidential Company'}</div>
                                                {job.isExternal && <span className="badge-premium-jooble">{job.jobType === 'Jooble' ? 'Jooble' : 'Global'}</span>}
                                            </div>
                                        </div>

                                        <div className="job-tags-premium">
                                            <span className="job-tag">
                                                <i className="fas fa-briefcase"></i> {job.jobType}
                                            </span>
                                            <span className="job-tag">
                                                <i className="fas fa-map-marker-alt"></i> {job.location}
                                            </span>
                                        </div>

                                        <p className="job-description-premium">{job.description || job.snippet}</p>

                                        <div className="job-footer-premium">
                                            <div className="salary-premium">
                                                <span className="salary-label">Salary Range</span>
                                                <span className="salary-value">{job.salaryRange}</span>
                                            </div>
                                            {job.isExternal ? (
                                                <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-premium-apply" style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}>
                                                    {job.jobType === 'Jooble' ? 'Apply on Jooble' : 'Apply Now'} <i className="fas fa-external-link-alt" style={{ fontSize: '0.8rem', marginLeft: '0.3rem' }}></i>
                                                </a>
                                            ) : (
                                                <Link to={`/job-details/${job._id}`} className="btn btn-primary btn-premium-apply">
                                                    View Details
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && jobs.length > 0 && (
                        <div className="pagination">
                            <button className="btn btn-outline" style={{ opacity: 0.5, pointerEvents: 'none' }}><i className="fas fa-chevron-left"></i></button>
                            <button className="btn btn-primary">1</button>
                            <button className="btn btn-outline">2</button>
                            <button className="btn btn-outline"><i className="fas fa-chevron-right"></i></button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Jobs;
