import { useState } from 'react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to a backend API
        console.log('Contact form submitted:', formData);
        setSubmitted(true);
    };

    return (
        <div style={{ minHeight: '100vh', padding: '6rem 0', background: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1e293b' }}>Get in Touch</h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '3rem', lineHeight: '1.6' }}>Have questions about JobLoom? We'd love to hear from you. Our team is here to help you find your next great hire or dream job.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '1.2rem' }}>
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#334155' }}>Visit Us</h3>
                                <p style={{ color: '#64748b' }}>123 Innovation Drive<br />Tech Valley, CA 94043</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '1.2rem' }}>
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#334155' }}>Email Us</h3>
                                <p style={{ color: '#64748b' }}>support@jobloom.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2.5rem', background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem auto' }}>
                                <i className="fas fa-check"></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '1rem' }}>Message Sent!</h3>
                            <p style={{ color: '#64748b' }}>Thank you for reaching out. We'll get back to you shortly.</p>
                            <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ marginTop: '2rem' }}>Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#334155' }}>Send us a message</h3>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '500' }}>Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '500' }}>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    required
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '500' }}>Message</label>
                                <textarea
                                    className="form-control"
                                    required
                                    rows="4"
                                    placeholder="How can we help?"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontWeight: '600' }}>Send Message</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
