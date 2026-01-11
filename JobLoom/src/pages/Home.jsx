import { Link } from 'react-router-dom';
import heroImage from '../assets/hero_image.png';

const Home = () => {
    return (
        <>
            <section className="hero reveal" style={{ height: "700px" }}>
                <div className="container hero-content">
                    <div className="hero-text">
                        <h1>Dream Jobs & <br /> Verified Skills</h1>
                        <p>Connect with top employers and showcase your verified credentials in one premium ecosystem. The
                            future of hiring is here.</p>
                        <div className="cta-group">
                            <Link to="/jobs" className="btn btn-primary">Find a Job</Link>
                            <Link to="/register?role=employer" className="btn btn-outline">Post a Job</Link>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src={heroImage} alt="JobLoom Hero" style={{ width: '200%', height: '150%', transform: 'scale(1.2)' }} />
                    </div>
                </div>
            </section>

            <section className="features-section-premium reveal">
                <div className="section-header-premium">
                    <h2 className="section-title-premium">Why Choose <span className="text-primary">JobLoom</span>?</h2>
                    <p className="section-subtitle-premium">Experience the future of professional networking.</p>
                </div>
                <div className="features-grid-premium">
                    <div className="feature-card-premium">
                        <div className="feature-icon-premium-box">
                            <i className="fas fa-search feature-icon-premium"></i>
                        </div>
                        <h4 className="feature-title-premium">Smart Job Search</h4>
                        <p className="feature-desc-premium">AI-powered matching that understands your potential beyond keywords.</p>
                    </div>
                    <div className="feature-card-premium">
                        <div className="feature-icon-premium-box">
                            <i className="fas fa-certificate feature-icon-premium"></i>
                        </div>
                        <h4 className="feature-title-premium">Instant Verification</h4>
                        <p className="feature-desc-premium">Blockchain-secured credentials that give you instant credibility with employers.</p>
                    </div>
                    <div className="feature-card-premium">
                        <div className="feature-icon-premium-box">
                            <i className="fas fa-shield-alt feature-icon-premium"></i>
                        </div>
                        <h4 className="feature-title-premium">Secure & Private</h4>
                        <p className="feature-desc-premium">Enterprise-grade protection for your most valuable professional data.</p>
                    </div>
                </div>
            </section>
            <section className="container reveal">
                <div className="poster-banner-premium compact">
                    <div className="poster-glass-card compact-card">
                        <div className="poster-text-content">
                            <h2 className="poster-title-premium compact-title">Empowering Your Career Journey</h2>
                            <p className="poster-tagline-premium compact-tagline">
                                Verified skills meet world-class opportunities.
                            </p>
                            <Link to="/register">
                                <button className="poster-btn-premium compact-btn">Get Started</button>
                            </Link>
                        </div>
                        <div className="poster-visual-content">
                            <div className="poster-logo-premium-container compact-logo-container">
                                <img src="/images/logo.svg" alt="JobLoom Logo" className="poster-logo-premium" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="timeline-section reveal">
                <div className="container">
                    <div className="section-title">
                        <h2>How It Works</h2>
                        <p>Your journey to a better career is just four simple steps away.</p>
                    </div>

                    <div className="timeline-steps">
                        <div className="timeline-step">
                            <div className="step-marker">1</div>
                            <div className="step-content">
                                <h5>Create Profile</h5>
                                <p>Build a dynamic digital presence that showcases your achievements and potential.</p>
                            </div>
                        </div>
                        <div className="timeline-step">
                            <div className="step-marker">2</div>
                            <div className="step-content">
                                <h5>Search Jobs</h5>
                                <p>Explore curated opportunities from top-tier companies across the globe.</p>
                            </div>
                        </div>
                        <div className="timeline-step">
                            <div className="step-marker">3</div>
                            <div className="step-content">
                                <h5>Apply & Verify</h5>
                                <p>Submit applications with confidence and get your skills validated in real-time.</p>
                            </div>
                        </div>
                        <div className="timeline-step">
                            <div className="step-marker">4</div>
                            <div className="step-content">
                                <h5>Get Hired</h5>
                                <p>Seal the deal with your dream employer and start your next professional chapter.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container reveal">
                <div className="stats-grid">
                    <div className="stat-item" style={{ textAlign: 'center' }}>
                        <h3>1.2k+</h3>
                        <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Jobs</p>
                    </div>
                    <div className="stat-item" style={{ textAlign: 'center' }}>
                        <h3>5k+</h3>
                        <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Talent</p>
                    </div>
                    <div className="stat-item" style={{ textAlign: 'center' }}>
                        <h3>800+</h3>
                        <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Top Partners</p>
                    </div>
                </div>
            </section>

            <section className="container reveal">
                <div className="cta-card">
                    <h2
                        style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                        Ready to Level Up?</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8, position: 'relative', zIndex: 1 }}>Join
                        the elite circle of professionals on JobLoom.</p>
                    <Link to="/register"><button className="btn-cool">Get Started Now</button></Link>
                </div>
            </section>
        </>
    );
};

export default Home;
