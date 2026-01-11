import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div style={{ minHeight: '100vh', padding: '6rem 0', background: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 600, textDecoration: 'none', marginBottom: '1rem' }}>
                        <i className="fas fa-arrow-left"></i> Back to Home
                    </Link>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Privacy Policy</h1>
                    <p style={{ color: '#64748b' }}>Last updated: January 2026</p>
                </div>

                {/* Content Card */}
                <div className="glass-card" style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '2.5rem' }}>

                    <section style={{ marginBottom: '0px' }}>
                        <p style={{ fontSize: '1.1rem', color: '#475569', }}>
                            At <strong>JobLoom</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                        </p>
                    </section>

                    <div style={{ height: '1px', background: '#e2e8f0', margin: '2rem 0' }}></div>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#eff6ff', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                            Information We Collect
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1rem' }}>We collect information that you strictly provide to us directly:</p>
                            <ul style={{ color: '#475569', lineHeight: '1.7', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li><strong>Personal Data:</strong> Name, email address, phone number, and profile picture.</li>
                                <li><strong>Professional Data:</strong> Resume/CV, employment history, education, skills, and certifications.</li>
                                <li><strong>Account Credentials:</strong> Passwords and security information used for authentication.</li>
                            </ul>
                        </div>
                    </section>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#eff6ff', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                            How We Use Your Information
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1rem' }}>We use the information we collect to:</p>
                            <ul style={{ color: '#475569', lineHeight: '1.7', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li>Provide, maintain, and improve our services.</li>
                                <li>Match job seekers with potential employers.</li>
                                <li>Process job applications and facilitate communication so you can get hired.</li>
                                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                                <li>Verify your identity and prevent fraud.</li>
                            </ul>
                        </div>
                    </section>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#eff6ff', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</span>
                            Sharing of Information
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7' }}>
                                We may share your information with <strong>Employers</strong> when you apply for a job or make your profile visible. We do not sell your personal data to third-party advertisers. We may also share data to comply with legal obligations or to protect the rights and safety of JobLoom and our users.
                            </p>
                        </div>
                    </section>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#eff6ff', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>4</span>
                            Data Security
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7' }}>
                                We implement industry-standard security measures to protect your personal information. This includes encryption of sensitive data (like passwords), secure servers, and restricted access to personal information. However, please note that no method of transmission over the Internet is 100% secure.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#eff6ff', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>5</span>
                            Contact Us
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1rem' }}>
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '12px', display: 'inline-block' }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>JobLoom Support Team</p>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>
                                    <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i> support@jobloom.com
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
