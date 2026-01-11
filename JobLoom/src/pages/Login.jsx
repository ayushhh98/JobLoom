import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // console.log("Debug: Submit prevented. Starting login...");

        try {
            const data = await login(email.trim(), password.trim(), 'seeker');
            console.log("Login Successful. Role:", data.user.role);

            // Redirect based on role
            const role = data.user.role ? data.user.role.toLowerCase().trim() : '';
            console.log("Normalized Role:", role);

            if (role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            } else {
                // Employers, Recruiters, and Seekers all go to Home as per request
                console.log("Redirecting to Home");
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Login failed');
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
                <div className="auth-header-premium" >
                    <Link to="/">
                        <img src="/images/logo.svg" alt="JobLoom" className="auth-logo-premium" style={{marginLeft :'6rem'}} />
                    </Link>
                    <h3 className="auth-title-premium">Welcome Back</h3>
                    <p className="auth-subtitle-premium">Sign in to continue your journey</p>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{ marginBottom: '1.5rem', borderRadius: '12px' }}>
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="modern-input-group">
                        <input
                            type="email"
                            id="email"
                            className="modern-input"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <i className="fas fa-envelope modern-input-icon"></i>
                    </div>

                    <div className="modern-input-group">
                        <input
                            type="password"
                            id="password"
                            className="modern-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i className="fas fa-lock modern-input-icon"></i>
                    </div>

                    <div className="form-actions-premium">
                        <label className="checkbox-premium">
                            <input type="checkbox" defaultChecked />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className="forgot-link-premium">Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn-auth-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Signing in...
                            </>
                        ) : (
                            <>
                                Sign In <i className="fas fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-divider">OR</div>

                <Link to="/recruiter-register" className="btn btn-outline btn-full" style={{ justifyContent: 'center', borderRadius: '12px', padding: '0.8rem', border: '2px solid #e2e8f0', color: '#64748b' }}>
                    <i className="fas fa-briefcase" style={{ marginRight: '0.5rem' }}></i> Register as Employer
                </Link>

                <div className="auth-footer-premium">
                    <p>Don't have an account? <Link to="/register" className="auth-link-premium">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
