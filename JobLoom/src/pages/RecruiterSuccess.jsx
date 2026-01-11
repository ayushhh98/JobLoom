import { Link } from 'react-router-dom';

const RecruiterSuccess = () => {
    return (
        <div className="auth-page-bg">
            <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gray)', fontWeight: 500, zIndex: 20, textDecoration: 'none' }}>
                <i className="fas fa-arrow-left"></i> Back to Home
            </Link>

            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div className="auth-header">
                    <img src="/images/logo.svg" alt="JobLoom" className="auth-logo" style={{ marginBottom: '2rem' }} />

                    <div className="check-icon">
                        <i className="fas fa-check"></i>
                    </div>

                    <h2 className="auth-title">Congratulations!</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
                        Your JobLoom recruiter account has been successfully created.<br />
                        You are now ready to find top talent.
                    </p>
                </div>

                <Link to="/dashboard-employer" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    Go to Dashboard <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                </Link>

                <div className="auth-footer">
                    <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>
                        Need help? <Link to="#" className="auth-link">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RecruiterSuccess;
