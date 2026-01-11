import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PostJob = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const { addToast } = useToast();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        jobType: 'Full-time',
        salaryRange: '',
        salaryCurrency: 'USD',
        location: '',
        qualifications: '',
        responsibilities: '',
        experienceLevel: 'Mid-Level',
        skills: [],
        companyId: '',
        companyLogo: '' // Optional URL
    });

    const [companies, setCompanies] = useState([]);

    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'employer' && user.role !== 'recruiter'))) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get('/companies');
                if (res.data.success) {
                    setCompanies(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch companies", err);
            }
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const fetchJob = async () => {
                setInitialLoading(true);
                try {
                    const res = await api.get(`/jobs/${id}`);
                    if (res.data.success) {
                        const job = res.data.data;
                        setFormData({
                            title: job.title || '',
                            description: job.description || '',
                            jobType: job.jobType || 'Full-time',
                            salaryRange: job.salaryRange || '',
                            salaryCurrency: job.salaryCurrency || 'USD',
                            location: job.location || '',
                            qualifications: job.qualifications || '',
                            responsibilities: job.responsibilities || '',
                            experienceLevel: job.experienceLevel || 'Mid-Level',
                            skills: job.skills || [],
                            companyLogo: job.companyLogo || ''
                        });
                    }
                } catch (err) {
                    setError('Failed to load job details');
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchJob();
        }
    }, [isEditMode, id]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = { ...formData };

            let res;
            if (isEditMode) {
                res = await api.put(`/jobs/${id}`, payload);
            } else {
                res = await api.post('/jobs', payload);
            }

            if (res.data.success) {
                addToast(`Job ${isEditMode ? 'updated' : 'posted'} successfully!`, 'success');
                navigate('/dashboard-employer?tab=jobs');
            } else {
                setError(res.data.message || 'Operation failed');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || initialLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #eef2ff, #f8fafc)',
            paddingTop: '100px',
            paddingBottom: '4rem'
        }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}>
                        {isEditMode ? 'Edit Job Listing' : 'Post a New Opportunity'}
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        {isEditMode ? 'Update the details below to attract the best talent.' : 'Create a compelling job post to find your next star employee.'}
                    </p>
                </div>

                <div className="glass-card" style={{
                    padding: '3rem',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0,0,0,0.1)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                background: '#fee2e2',
                                border: '1px solid #fecaca',
                                color: '#ef4444',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <i className="fas fa-exclamation-circle"></i>
                                {error}
                            </div>
                        )}

                        {/* Section: Job Basics */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '1.5rem', color: '#334155', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ background: '#e0e7ff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>1</span>
                                Job Basics
                            </h4>

                            {companies.length > 0 && (
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Post on behalf of Company (Optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            id="companyId"
                                            className="form-control"
                                            value={formData.companyId}
                                            onChange={(e) => {
                                                const selectedCompany = companies.find(c => c._id === e.target.value);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    companyId: e.target.value,
                                                    companyLogo: selectedCompany ? selectedCompany.logo : prev.companyLogo,
                                                    location: selectedCompany && selectedCompany.location ? selectedCompany.location : prev.location
                                                }));
                                            }}
                                            style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0', appearance: 'none' }}
                                        >
                                            <option value="">-- Post as Individual / Default --</option>
                                            {companies.map(company => (
                                                <option key={company._id} value={company._id}>{company.name}</option>
                                            ))}
                                        </select>
                                        <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}></i>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Job Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    className="form-control"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Job Type</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            id="jobType"
                                            className="form-control"
                                            value={formData.jobType}
                                            onChange={handleChange}
                                            style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0', appearance: 'none' }}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Freelance">Freelance</option>
                                        </select>
                                        <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}></i>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Experience Level</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            id="experienceLevel"
                                            className="form-control"
                                            value={formData.experienceLevel}
                                            onChange={handleChange}
                                            style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0', appearance: 'none' }}
                                        >
                                            <option value="Entry Level">Entry Level</option>
                                            <option value="Mid-Level">Mid-Level</option>
                                            <option value="Senior Level">Senior Level</option>
                                            <option value="Executive">Executive</option>
                                        </select>
                                        <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}></i>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Location</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        id="location"
                                        className="form-control"
                                        placeholder="e.g. San Francisco, CA (Remote)"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '0.875rem 1rem 0.875rem 2.5rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0' }}
                                    />
                                    <i className="fas fa-map-marker-alt" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                                </div>
                            </div>
                        </div>

                        {/* Section: Compensation */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '1.5rem', color: '#334155', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ background: '#e0e7ff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>2</span>
                                Compensation
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Currency</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            id="salaryCurrency"
                                            className="form-control"
                                            value={formData.salaryCurrency}
                                            onChange={handleChange}
                                            style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0', appearance: 'none' }}
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="INR">INR (₹)</option>
                                            <option value="AUD">AUD ($)</option>
                                            <option value="CAD">CAD ($)</option>
                                        </select>
                                        <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}></i>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Salary Range</label>
                                    <input
                                        type="text"
                                        id="salaryRange"
                                        className="form-control"
                                        placeholder="e.g. 100k - 140k"
                                        value={formData.salaryRange}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                                        <i className="fas fa-info-circle"></i> Jobs with clear salary ranges get <span style={{ fontWeight: '600', color: '#4f46e5' }}>30% more</span> applicants.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Details & Requirements */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '1.5rem', color: '#334155', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ background: '#e0e7ff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>3</span>
                                Requirements & Skills
                            </h4>

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Required Skills (Press Enter to add)</label>
                                <div style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    background: 'white',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    minHeight: '52px'
                                }}>
                                    {formData.skills.map((skill, index) => (
                                        <span key={index} style={{
                                            background: '#e0e7ff',
                                            color: '#4f46e5',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {skill}
                                            <i className="fas fa-times" onClick={() => removeSkill(skill)} style={{ cursor: 'pointer', opacity: 0.7 }}></i>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleSkillKeyDown}
                                        placeholder={formData.skills.length === 0 ? "add skills..." : ""}
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            flex: 1,
                                            minWidth: '120px',
                                            padding: '0.5rem',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Job Description</label>
                                <textarea
                                    id="description"
                                    className="form-control"
                                    rows="6"
                                    placeholder="Describe the role, team, and company culture..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0', resize: 'vertical' }}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Key Responsibilities</label>
                                <textarea
                                    id="responsibilities"
                                    className="form-control"
                                    rows="4"
                                    placeholder="What will the employee do on a day-to-day basis?"
                                    value={formData.responsibilities}
                                    onChange={handleChange}
                                    required
                                    style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0', resize: 'vertical' }}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Qualifications / Requirements</label>
                                <textarea
                                    id="qualifications"
                                    className="form-control"
                                    rows="4"
                                    placeholder="Education, certifications, and years of experience..."
                                    value={formData.qualifications}
                                    onChange={handleChange}
                                    required
                                    style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0', resize: 'vertical' }}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '600' }}>Company Logo URL (Optional)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        id="companyLogo"
                                        className="form-control"
                                        placeholder="https://example.com/logo.png"
                                        value={formData.companyLogo}
                                        onChange={handleChange}
                                        style={{ padding: '0.875rem 1rem 0.875rem 2.5rem', fontSize: '1rem', borderRadius: '12px', borderColor: '#e2e8f0' }}
                                    />
                                    <i className="fas fa-image" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
                            {isEditMode && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate('/dashboard-employer?tab=jobs')}
                                    style={{
                                        flex: 1,
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        border: '2px solid #e2e8f0',
                                        color: '#64748b',
                                        fontWeight: '600',
                                        background: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{
                                    flex: 2,
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.8 : 1
                                }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-spinner fa-spin"></i> Processing...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-check-circle"></i> {isEditMode ? 'Update Job Posting' : 'Publish Job Listing'}
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJob;
