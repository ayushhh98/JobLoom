import { Link } from 'react-router-dom';

const HelpCenter = () => {
    return (
        <div style={{ minHeight: '100vh', padding: '6rem 0', background: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: '#1e293b' }}>Help Center</h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b' }}>We're here to help. Find answers to common questions below.</p>
                </div>

                <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'white', borderRadius: '16px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#334155' }}>General Questions</h2>
                    <details style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#475569' }}>How do I create an account?</summary>
                        <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Click on the "Register" button in the top right corner. You can choose to register as a Job Seeker or an Employer/Recruiter.</p>
                    </details>
                    <details style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Is JobLoom free to use?</summary>
                        <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Yes, job seekers can search and apply for jobs for free. Employers may have different pricing tiers for posting jobs (currently in beta).</p>
                    </details>
                </div>

                <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'white', borderRadius: '16px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#334155' }}>For Employers</h2>
                    <details style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#475569' }}>How do I post a job?</summary>
                        <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Log in to your employer account, go to your Dashboard, and click "Post New Job". Fill in the details and submit.</p>
                    </details>
                    <details style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Can I edit a posted job?</summary>
                        <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Yes, navigate to your Dashboard, find the job in the "Recent Jobs" list, and click the "Edit" button.</p>
                    </details>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <p style={{ color: '#64748b' }}>Still need help?</p>
                    <Link to="/contact" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Contact Support</Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
