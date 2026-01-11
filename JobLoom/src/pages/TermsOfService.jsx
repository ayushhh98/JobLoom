import { Link } from 'react-router-dom';

const TermsOfService = () => {
    return (
        <div style={{ minHeight: '100vh', padding: '6rem 0', background: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 600, textDecoration: 'none', marginBottom: '1rem' }}>
                        <i className="fas fa-arrow-left"></i> Back to Home
                    </Link>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Terms of Service</h1>
                    <p style={{ color: '#64748b' }}>Effective Date: January 2026</p>
                </div>

                {/* Content Card */}
                <div className="glass-card" style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.8' }}>
                            Welcome to <strong>JobLoom</strong>! By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree to all strictly these terms, please do not use our services.
                        </p>
                    </section>

                    <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '2.5rem' }}></div>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#f0f9ff', color: '#0ea5e9', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                            User Accounts
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1rem' }}>
                                To access certain features of JobLoom (e.g., posting jobs, applying for jobs), you must register for an account. By creating an account, you agree to:
                            </p>
                            <ul style={{ color: '#475569', lineHeight: '1.7', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li>Provide accurate and complete information.</li>
                                <li>Maintain the security of your password and account details.</li>
                                <li>Promptly notify us if you discover any security breach.</li>
                                <li>Accept full responsibility for all activities that occur under your account.</li>
                            </ul>
                        </div>
                    </section>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#f0f9ff', color: '#0ea5e9', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                            User Content & License
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1rem' }}>
                                You retain full ownership of the content you submit, including resumes, job postings, and profile details. However, by submitting content, you grant JobLoom a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content for the purpose of operating our services.
                            </p>
                            <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f43f5e' }}>
                                <p style={{ margin: 0, color: '#9f1239', fontSize: '0.9rem' }}>
                                    <strong>Important:</strong> You represent that you own or have the necessary rights to all content you post and that it does not violate any third-party rights.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#f0f9ff', color: '#0ea5e9', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</span>
                            Prohibited Activities
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1rem' }}>You agree NOT to engage in the following prohibited activities:</p>
                            <ul style={{ color: '#475569', lineHeight: '1.7', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li>Posting false, misleading, or fraudulent job listings or resumes.</li>
                                <li>Harassing, abusing, or harming another person.</li>
                                <li>Using automated means (bots, scrapers) to access the site without permission.</li>
                                <li>Interfering with the proper working of the JobLoom platform.</li>
                            </ul>
                        </div>
                    </section>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#f0f9ff', color: '#0ea5e9', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>4</span>
                            Termination
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7' }}>
                                JobLoom reserves the right to suspend or terminate your account and access to the services at any time, without notice, if we believe you have violated these Terms of Service.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: '#f0f9ff', color: '#0ea5e9', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>5</span>
                            Contact Us
                        </h2>
                        <div style={{ paddingLeft: '3.5rem' }}>
                            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '1rem' }}>
                                For any questions regarding these Terms, you may contact us using the information below:
                            </p>
                            <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '12px', display: 'inline-block' }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>JobLoom Legal Team</p>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>
                                    <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i> legal@jobloom.com
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
