import React, { useState } from 'react';
import api from '../services/api';

const CertificateVerification = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await api.get(`/cert/search/${query}`);
            if (res.data.success) {
                setResult(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Certificate not found. Please check the ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>

            {/* Header Section */}
            <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--color-primary-light)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 20px rgba(79, 70, 229, 0.2)'
                }}>
                    <i className="fas fa-medal" style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}></i>
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-dark)', marginBottom: '1rem' }}>
                    Verify <span className="text-primary">Certificate</span>
                </h1>
                <p style={{ color: 'var(--color-gray)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Enter your Certificate ID or Email to verify authenticity and retrieve your credentials instantly.
                </p>
            </div>

            {/* Main Card */}
            <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '900px', padding: '3rem', background: 'white', border: '1px solid var(--color-gray-lighter)' }}>

                {/* Search Form */}
                <form onSubmit={handleVerify} style={{ display: 'flex', gap: '1rem', marginBottom: result ? '2rem' : '4rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Certificate ID (e.g., JL-12345) or Email"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.2rem 1.5rem',
                                borderRadius: '12px',
                                border: '2px solid var(--color-gray-lighter)',
                                fontSize: '1.1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-gray-lighter)'}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0 2.5rem',
                            height: '60px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.2s'
                        }}
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Verify'}
                    </button>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="animate-fade-in" style={{ marginBottom: '3rem', padding: '1rem', background: '#fff1f2', color: '#e11d48', borderRadius: '12px', border: '1px solid #ffe4e6', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
                        <i className="fas fa-exclamation-circle" style={{ fontSize: '1.2rem' }}></i>
                        <span style={{ fontWeight: '500' }}>{error}</span>
                    </div>
                )}

                {/* Result Section */}
                {result ? (
                    <div className="animate-fade-in" style={{ padding: '2rem', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-gray-lighter)' }}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--color-success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: 'var(--color-success)' }}></i>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-success)' }}>Verified & Authentic</h3>
                                <p style={{ margin: 0, color: 'var(--color-gray)' }}>This certificate is valid and issued by JobLoom.</p>
                            </div>
                            {result.pdfUrl && (
                                <a
                                    href={`${api.defaults.baseURL}/cert/download/${result.certificateId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn"
                                    style={{ marginLeft: 'auto', background: 'var(--color-dark)', color: 'white', padding: '0.8rem 1.5rem' }}
                                >
                                    <i className="fas fa-download"></i> Download PDF
                                </a>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Student Name</label>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark)' }}>{result.name}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Course</label>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark)' }}>{result.course}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Issued On</label>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark)' }}>{new Date(result.issueDate).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Certificate ID</label>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark)' }}>{result.certificateId}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Features Grid (Only show when no result) */
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', borderTop: '1px solid var(--color-gray-lighter)', paddingTop: '3rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <i className="fas fa-shield-alt" style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}></i>
                            <h4 style={{ marginBottom: '0.5rem' }}>Secure</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>End-to-end encrypted verification.</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <i className="fas fa-certificate" style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}></i>
                            <h4 style={{ marginBottom: '0.5rem' }}>Authentic</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>Verified directly by JobLoom.</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <i className="fas fa-bolt" style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}></i>
                            <h4 style={{ marginBottom: '0.5rem' }}>Instant</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>Results in seconds.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateVerification;
