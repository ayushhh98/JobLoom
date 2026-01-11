import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        location: '',
        logo: ''
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies');
            if (res.data.success) {
                setCompanies(res.data.data);
            }
        } catch (err) {
            console.error(err);
            addToast('Failed to load companies', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/companies', formData);
            if (res.data.success) {
                setCompanies([...companies, res.data.data]);
                addToast('Company created successfully', 'success');
                setShowForm(false);
                setFormData({ name: '', description: '', website: '', location: '', logo: '' });
            }
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to create company', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this company?')) return;
        try {
            const res = await api.delete(`/companies/${id}`);
            if (res.data.success) {
                setCompanies(companies.filter(c => c._id !== id));
                addToast('Company deleted', 'success');
            }
        } catch (err) {
            addToast('Failed to delete company', 'error');
        }
    };

    if (loading) return <div className="text-center p-5">Loading companies...</div>;

    return (
        <div className="animate-fade-in" style={{ padding: '0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>My <span className="text-primary">Companies</span></h2>
                    <p style={{ color: 'var(--color-gray)', marginTop: '0.5rem' }}>Manage your company profiles (Max 5)</p>
                </div>
                {companies.length < 5 && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary"
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}
                    >
                        <i className={`fas fa-${showForm ? 'minus' : 'plus'}`}></i> {showForm ? 'Cancel' : 'Add Company'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', background: 'white' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Create New Company Profile</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label>Company Name *</label>
                            <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="form-group mb-3">
                            <label>Website</label>
                            <input type="url" name="website" className="form-control" placeholder="https://example.com" value={formData.website} onChange={handleChange} />
                        </div>
                        <div className="form-group mb-3">
                            <label>Location</label>
                            <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} />
                        </div>
                        <div className="form-group mb-3">
                            <label>Logo URL (Optional)</label>
                            <input type="text" name="logo" className="form-control" placeholder="https://..." value={formData.logo} onChange={handleChange} />
                        </div>
                        <div className="form-group mb-3">
                            <label>Description</label>
                            <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">Create Company</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {companies.map(company => (
                    <div key={company._id} className="glass-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', color: '#6366f1', fontSize: '1.5rem' }}>
                                {company.logo && company.logo !== 'no-photo.jpg' ? (
                                    <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                ) : (
                                    <i className="fas fa-building"></i>
                                )}
                            </div>
                            <button onClick={() => handleDelete(company._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{company.name}</h3>
                        {company.location && <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}><i className="fas fa-map-marker-alt"></i> {company.location}</p>}
                        {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '0.9rem' }}><i className="fas fa-link"></i> Website</a>}
                    </div>
                ))}
                {companies.length === 0 && !showForm && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <i className="fas fa-building" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                        <p>You haven't created any additional company profiles yet.</p>
                        <p style={{ fontSize: '0.9rem' }}>Post jobs faster by setting up your company details once.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyManagement;
