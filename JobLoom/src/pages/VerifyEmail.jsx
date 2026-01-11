import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithData } = useAuth();

    // Get email and role from URL or state if passed
    const emailParam = searchParams.get('email');

    // Determine target dashboard based on role (default to seeker if unknown)
    const roleParam = searchParams.get('role') || 'seeker';
    const tokenParam = searchParams.get('token');

    const [email, setEmail] = useState(emailParam || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState('');

    // Auto-verify if token is present
    useEffect(() => {
        if (tokenParam) {
            verifyToken(tokenParam);
        }
    }, [tokenParam]);

    const verifyToken = async (token) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-token', { token });
            if (res.data.success) {
                loginWithData(res.data.token, res.data.user);
                redirectUser(res.data.user.role);
            } else {
                setError(res.data.error || 'Verification failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const redirectUser = (role) => {
        if (role === 'employer') {
            navigate('/dashboard-employer');
        } else if (role === 'admin') {
            navigate('/admin-dashboard');
        } else {
            navigate('/dashboard-seeker');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/verify-email', { email, otp });
            if (res.data.success) {
                // Login immediately
                loginWithData(res.data.token, res.data.user);
                redirectUser(res.data.user.role);
            } else {
                setError(res.data.error || 'Verification failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendStatus('Sending...');
        try {
            const res = await api.post('/auth/resend-otp', { email });
            if (res.data.success) {
                setResendStatus('OTP Resent!');
            }
        } catch (err) {
            setResendStatus('Failed to resend');
        }
    };

    return (
        <div className="auth-page-bg">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Verify Email</h2>
                    <p className="auth-subtitle">Enter the code sent to {email}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ color: '#ef4444', background: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div className="input-group">
                        <i className="fas fa-key input-icon"></i>
                        <input
                            type="text"
                            className="form-control form-control-icon"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button type="button" onClick={handleResend} className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                            Resend Code
                        </button>
                        {resendStatus && <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)', marginTop: '0.5rem' }}>{resendStatus}</span>}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
