import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RecruiterRegister = () => {
    const navigate = useNavigate();
    const { loginWithData } = useAuth();
    const { addToast } = useToast();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        mobile: '',
        account_type: 'company',
        name: '',
        email: '',
        password: '',
        hiring_for: 'company',
        companyName: '',
        employees: '',
        designation: '',
        pincode: '',
        address: '',
        otp: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
                setError('Please fill in all basic details');
                return;
            }
            setStep(2);
            setError('');
        }
    };

    const handlePrev = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'employer',
            mobile: formData.mobile,
            companyName: formData.companyName,
            companyDetails: {
                hiringFor: formData.hiring_for,
                employees: formData.employees,
                designation: formData.designation,
                pincode: formData.pincode,
                address: formData.address
            }
        };

        try {
            const res = await api.post('/auth/register', payload);
            if (res.data.success || res.status === 200) {
                setSuccess(true);
                // Move to OTP step instead of redirecting
                setStep(3);
                setSuccess(false); // Reset success to show fresh UI or keep it? Better to clean it.
                // But wait, user needs to know OTP was sent.
                // We can show a message in Step 3.
            } else {
                setError(res.data.error || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/verify-email', {
                email: formData.email,
                otp: formData.otp
            });

            if (res.data.success || res.status === 200) {
                // Auto login
                const { token, user } = res.data;
                loginWithData(token, user);
                navigate('/dashboard-employer', { replace: true });
            } else {
                setError(res.data.message || 'Verification failed');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Verification failed. Please check OTP.');
        }
    };

    const handleResendOtp = async () => {
        try {
            await api.post('/auth/resend-otp', { email: formData.email });
            addToast('OTP resent successfully!', 'success');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        }
    };

    return (
        <div className="auth-container-premium">
            <div className="auth-blob auth-blob-1"></div>
            <div className="auth-blob auth-blob-2"></div>

            <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 600, zIndex: 20 }}>
                <i className="fas fa-arrow-left"></i> Back to Home
            </Link>

            <div className="auth-card-premium wide fade-in-up">
                <div className="auth-header-premium">
                    <h2 className="auth-title-premium">Recruiter Sign Up</h2>
                    <p className="auth-subtitle-premium">Find the best talent for your company</p>
                </div>

                {/* Premium Stepper */}
                <div className="stepper-premium">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        {step > 1 ? <i className="fas fa-check"></i> : '1'}
                    </div>
                    <div style={{ width: '40px', height: '2px', background: '#e2e8f0', alignSelf: 'center' }} className={step > 1 ? 'bg-primary' : ''}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        {step > 2 ? <i className="fas fa-check"></i> : '2'}
                    </div>
                    <div style={{ width: '40px', height: '2px', background: '#e2e8f0', alignSelf: 'center' }} className={step > 2 ? 'bg-primary' : ''}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
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

                    {/* STEP 1: Basic Details */}
                    {step === 1 && (
                        <div className="fade-in">
                            <div className="modern-input-group">
                                <input
                                    type="tel"
                                    name="mobile"
                                    className="modern-input"
                                    placeholder="Mobile Number (+91)"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="fas fa-phone modern-input-icon"></i>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                                    Account Type:
                                </label>
                                <div className="role-toggle-premium" style={{ marginBottom: 0 }}>
                                    <div
                                        className={`role-option ${formData.account_type === 'company' ? 'active' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, account_type: 'company' }))}
                                    >
                                        Company
                                    </div>
                                    <div
                                        className={`role-option ${formData.account_type === 'individual' ? 'active' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, account_type: 'individual' }))}
                                    >
                                        Individual
                                    </div>
                                </div>
                            </div>

                            <div className="modern-input-group">
                                <input
                                    type="text"
                                    name="name"
                                    className="modern-input"
                                    placeholder="Full Name (as per PAN)"
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
                                    placeholder="Official Email ID"
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
                                    placeholder="Create Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="fas fa-lock modern-input-icon"></i>
                            </div>

                            <button type="button" className="btn-auth-primary" onClick={handleNext}>
                                Continue <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Company Details */}
                    {step === 2 && (
                        <div className="fade-in">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                                    Hiring For:
                                </label>
                                <div className="role-toggle-premium" style={{ marginBottom: 0 }}>
                                    <div
                                        className={`role-option ${formData.hiring_for === 'company' ? 'active' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, hiring_for: 'company' }))}
                                    >
                                        My Company
                                    </div>
                                    <div
                                        className={`role-option ${formData.hiring_for === 'consultancy' ? 'active' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, hiring_for: 'consultancy' }))}
                                    >
                                        Consultancy
                                    </div>
                                </div>
                            </div>

                            <div className="modern-input-group">
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

                            <div className="modern-input-group">
                                <select
                                    name="employees"
                                    className="modern-input"
                                    style={{ appearance: 'none' }}
                                    value={formData.employees}
                                    onChange={handleChange}
                                >
                                    <option value="">Number of Employees</option>
                                    <option value="1-10">1-10</option>
                                    <option value="11-50">11-50</option>
                                    <option value="51-200">51-200</option>
                                    <option value="200+">200+</option>
                                </select>
                                <i className="fas fa-users modern-input-icon"></i>
                                <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}></i>
                            </div>

                            <div className="modern-input-group">
                                <input
                                    type="text"
                                    name="designation"
                                    className="modern-input"
                                    placeholder="Your Designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="far fa-id-badge modern-input-icon"></i>
                            </div>

                            <div className="modern-input-group">
                                <input
                                    type="text"
                                    name="pincode"
                                    className="modern-input"
                                    placeholder="Pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="fas fa-map-marker-alt modern-input-icon"></i>
                            </div>

                            <div className="modern-input-group">
                                <textarea
                                    name="address"
                                    className="modern-input"
                                    rows="2"
                                    placeholder="Company Address"
                                    style={{ paddingTop: '1rem', height: 'auto' }}
                                    value={formData.address}
                                    onChange={handleChange}
                                ></textarea>
                                <i className="far fa-map modern-input-icon" style={{ top: '1.5rem' }}></i>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn-auth-primary"
                                    style={{ background: 'white', color: '#475569', border: '2px solid #e2e8f0', boxShadow: 'none' }}
                                    onClick={handlePrev}
                                >
                                    Back
                                </button>
                                <button type="submit" className="btn-auth-primary">Create Account</button>
                            </div>
                        </div>
                    )}
                    {/* STEP 3: OTP Verification */}
                    {step === 3 && (
                        <div className="fade-in text-center">
                            <h3 className="mb-3" style={{ color: '#1e293b' }}>Verify Your Email</h3>
                            <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                                We've sent a 6-digit code to <strong>{formData.email}</strong>.
                            </p>

                            <div className="modern-input-group mb-4">
                                <input
                                    type="text"
                                    name="otp"
                                    className="modern-input text-center"
                                    placeholder="Enter 6-Digit OTP"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    style={{ letterSpacing: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}
                                    maxLength="6"
                                    required
                                />
                            </div>

                            <button type="button" className="btn-auth-primary mb-3" onClick={handleVerifyOtp}>
                                Verify & Login
                            </button>

                            <p className="text-muted small">
                                Didn't receive code? <button type="button" onClick={handleResendOtp} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Resend</button>
                            </p>
                        </div>
                    )}
                </form>

                <div className="auth-footer-premium">
                    <p>
                        Already have an account? <Link to="/login" className="auth-link-premium">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RecruiterRegister;
