import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ background: 'var(--color-white)', padding: '4rem 0 2rem', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
            <div className="container">
                <div className="footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                    <div className="footer-brand">
                        <div className="logo" style={{ marginBottom: '1rem' }}>
                            <Link to="/"><img src="/images/logo.svg" alt="JobLoom" style={{ height: '50px' }} /></Link>
                        </div>
                        <p style={{ color: 'var(--color-gray)', lineHeight: '1.6' }}>Connecting talent with opportunity. The next generation job portal for professionals and companies.</p>
                    </div>

                    <div className="footer-links">
                        <h4 style={{ marginBottom: '1.5rem', color: 'var(--color-dark)' }}>Quick Links</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><Link to="/" style={{ color: 'var(--color-gray)', transition: 'color 0.3s' }}>Home</Link></li>
                            <li><Link to="/jobs" style={{ color: 'var(--color-gray)', transition: 'color 0.3s' }}>Find Jobs</Link></li>
                            <li><Link to="/recruiter-register" style={{ color: 'var(--color-gray)', transition: 'color 0.3s' }}>Post a Job</Link></li>
                            <li><Link to="/certificate-management" style={{ color: 'var(--color-gray)', transition: 'color 0.3s' }}>Verify Certificates</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4 style={{ marginBottom: '1.5rem', color: 'var(--color-dark)' }}>Support</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><Link to="/help" style={{ color: 'var(--color-gray)', transition: 'color 0.3s' }}>Help Center</Link></li>
                            <li><Link to="/privacy" style={{ color: 'var(--color-gray)', transition: 'color 0.3s' }}>Privacy Policy</Link></li>
                            <li><Link to="/terms" style={{ color: 'var(--color-gray)', transition: 'color 0.3s' }}>Terms of Service</Link></li>
                            <li><Link to="/contact" style={{ color: 'var(--color-gray)', transition: 'color 0.3s' }}>Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="footer-newsletter">
                        <h4 style={{ marginBottom: '1.5rem', color: 'var(--color-dark)' }}>Stay Connected</h4>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}><i className="fab fa-twitter"></i></a>
                            <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}><i className="fab fa-linkedin-in"></i></a>
                            <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>&copy; 2025 JobLoom. All rights reserved.</p>
                    <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>Designed with <i className="fas fa-heart" style={{ color: 'var(--color-danger)' }}></i> for professionals.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
