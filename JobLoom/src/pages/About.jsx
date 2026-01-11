import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const teamMembers = [
        { name: 'Sarah Jenkins', role: 'CEO & Founder', icon: 'fa-user-tie' },
        { name: 'David Chen', role: 'CTO', icon: 'fa-code' },
        { name: 'Maria Rodriguez', role: 'Head of Talent', icon: 'fa-users' }
    ];

    return (
        <main className="container page-content">
            {/* Hero Section */}
            <section className="text-center mb-5 reveal">
                <h1 className="mb-3">
                    About <span className="text-primary">JobLoom</span>
                </h1>
                <p className="text-muted section-title-desc mx-auto" style={{ maxWidth: '700px', fontSize: '1.2rem' }}>
                    Bridging the gap between talent and opportunity with AI-driven connections. We're re-imagining how the world hires.
                </p>
            </section>

            {/* Mission & Vision */}
            <div className="grid-2 mb-5 gap-4">
                <div className="glass-card reveal hover-lift p-5">
                    <div className="icon-box mb-4 rounded-3 d-inline-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px', fontSize: '1.75rem', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', color: 'var(--color-primary)' }}>
                        <i className="fas fa-bullseye"></i>
                    </div>
                    <h2 className="h3 mb-3" style={{ fontWeight: 700 }}>Our Mission</h2>
                    <p className="text-muted" style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                        To empower job seekers and employers by providing a seamless, intelligent, and transparent hiring platform. We believe in finding the perfect match, not just filling a vacancy.
                    </p>
                </div>
                <div className="glass-card reveal delay-200 hover-lift p-5">
                    <div className="icon-box mb-4 rounded-3 d-inline-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px', fontSize: '1.75rem', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', color: 'var(--color-success)' }}>
                        <i className="fas fa-eye"></i>
                    </div>
                    <h2 className="h3 mb-3" style={{ fontWeight: 700 }}>Our Vision</h2>
                    <p className="text-muted" style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                        A world where every individual can find meaningful work that aligns with their skills and passion, and where companies can build dream teams with ease.
                    </p>
                </div>
            </div>

            {/* Why Choose Us */}
            <section className="mb-5 reveal">
                <div className="section-title text-center mb-5">
                    <h2>Why Choose Us?</h2>
                    <p>We bring innovation to recruitment.</p>
                </div>
                <div className="grid-3">
                    <div className="glass-card text-center p-4">
                        <i className="fas fa-shield-alt text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                        <h4 className="mb-2">Verified Listings</h4>
                        <p className="text-muted small">Every job and company is vetted for authenticity.</p>
                    </div>
                    <div className="glass-card text-center p-4">
                        <i className="fas fa-bolt text-warning mb-3" style={{ fontSize: '2.5rem' }}></i>
                        <h4 className="mb-2">Fast Connections</h4>
                        <p className="text-muted small">Direct communication between recruiters and talent.</p>
                    </div>
                    <div className="glass-card text-center p-4">
                        <i className="fas fa-user-shield text-danger mb-3" style={{ fontSize: '2.5rem' }}></i>
                        <h4 className="mb-2">Data Privacy</h4>
                        <p className="text-muted small">Your personal information is secure with us.</p>
                    </div>
                </div>
            </section>

            {/* Our Team Section (New) */}
            <section className="mb-5 reveal">
                <div className="section-title text-center mb-5">
                    <h2>Meet the Team</h2>
                    <p>The minds behind the platform.</p>
                </div>
                <div className="grid-3">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="glass-card text-center p-4 hover-lift">
                            <div className="mx-auto mb-3 bg-gray-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', background: '#f3f4f6' }}>
                                <i className={`fas ${member.icon} text-muted`} style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h4 className="mb-1">{member.name}</h4>
                            <p className="text-primary small font-weight-bold">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div className="glass-card text-center reveal p-5 text-white" style={{ background: 'var(--gradient-premium)' }}>
                <h2 className="mb-3 text-white">Ready to start your journey?</h2>
                <p className="mb-4 opacity-75">Join thousands of users already finding success on JobLoom.</p>
                <div className="d-flex gap-3 justify-content-center">
                    <Link to="/jobs" className="btn btn-light text-primary fw-bold">Browse Jobs</Link>
                    <Link to="/register" className="btn btn-outline-light">Sign Up Now</Link>
                </div>
            </div>
        </main>
    );
};

export default About;
