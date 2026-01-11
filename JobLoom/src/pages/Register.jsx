import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'; // Keep useSearchParams for now, though new code doesn't use it directly
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // Keep this for initial role setting if needed, though new code uses a step-based approach
    const { loginWithData } = useAuth();

    const [step, setStep] = useState(1);

    // Initialize role from URL param if present
    const [role, setRole] = useState(searchParams.get('role') === 'employer' ? 'employer' : 'seeker');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '' // Only for employer
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); // Added missing success state
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');



        setLoading(true);

        try {
            const endpoint = '/auth/register';
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: role
            };

            if (role === 'employer') {
                payload.companyName = formData.companyName;
            }

            const res = await api.post(endpoint, payload);

            if (res.data.success) {
                // Redirect to verification
                navigate(`/verify-email?email=${formData.email}&role=${role}`);
            } else {
                setError(res.data.error || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container-premium">
            <div className="auth-blob auth-blob-1"></div>
            <div className="auth-blob auth-blob-2"></div>

            <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 600, zIndex: 20 }}>
                <i className="fas fa-arrow-left"></i> Back to Home
            </Link>

            <div className="auth-card-premium fade-in-up">
                <div className="auth-header-premium">
                    <img src="/images/logo.svg" alt="JobLoom" className="auth-logo-premium"  style={{marginLeft :'6rem'}}/>
                    <h3 className="auth-title-premium">Create Account</h3>
                    <p className="auth-subtitle-premium">Join the future of hiring</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ color: '#ef4444', background: '#fee2e2', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ color: '#15803d', background: '#dcfce7', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                            Account created successfully! Redirecting...
                        </div>
                    )}

                    <div className="modern-input-group">
                        <input
                            type="text"
                            name="name"
                            className="modern-input"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <i className="far fa-user modern-input-icon"></i>
                    </div>

                    <div className="modern-input-group">
                        <input
                            type="email"
                            name="email"
                            className="modern-input"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <i className="far fa-envelope modern-input-icon"></i>
                    </div>

                    <div className="modern-input-group">
                        <input
                            type="password"
                            name="password"
                            className="modern-input"
                            placeholder="Create Password (Min 6 chars)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                        <i className="fas fa-lock modern-input-icon"></i>
                    </div>

                    <div className="role-toggle-premium">
                        <div
                            className={`role-option ${formData.role === 'seeker' ? 'active' : ''}`}
                            onClick={() => setRole('seeker')}
                        >
                            Job Seeker
                        </div>
                        <div
                            className={`role-option ${formData.role === 'employer' ? 'active' : ''}`}
                            onClick={() => setRole('employer')}
                        >
                            Employer
                        </div>
                    </div>

                    {/* Hidden inputs to keep state in sync if needed, though state is managed directly via onClick usually. 
                        Keeping original logic mapping if strictly needed, but role state is top-level.
                        The original used radio buttons, here we use a custom toggle UI updating state directly.
                    */}

                    {role === 'employer' && (
                        <div className="modern-input-group fade-in">
                            <input
                                type="text"
                                name="companyName"
                                className="modern-input"
                                placeholder="Company Name"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                            />
                            <i className="far fa-building modern-input-icon"></i>
                        </div>
                    )}

                    <button type="submit" className="btn-auth-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Get Started'} <i className="fas fa-arrow-right"></i>
                    </button>
                </form>

                <div className="auth-footer-premium">
                    <p>
                        Already have an account? <Link to="/login" className="auth-link-premium">Login</Link>
                    </p>
                    <p style={{ marginTop: '0.8rem', fontSize: '0.9rem' }}>
                        Hiring at scale? <Link to="/recruiter-register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Recruiter Registration</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
