import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';

const ensureProtocol = (url) => {
    if (!url) return '';
    // Remove leading/trailing whitespace and leading slashes (often pasted by mistake)
    let cleanUrl = url.replace(/^[\s\/]+/, '').replace(/\s+$/, '');

    if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
    }
    return cleanUrl;
};

const Profile = () => {
    const navigate = useNavigate();
    const { user, setUser, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [alert, setAlert] = useState({ type: '', message: '' });

    // Personal Info State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        gender: '',
        location: '',
        headline: '',
        skills: '',
        profilePhoto: null,
        // New Fields
        address: '',
        tenth: '',
        twelfth: '',
        sgpa: '',
        github: '',
        linkedin: '',
        portfolio: '',
        about: '',
        projects: '',
        happyClients: '',
        yearsExperience: '',
        awards: ''
    });

    // Notifications State
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        pushNotifications: false,
        marketingEmails: false,
        jobRecommendations: true
    });

    // Security State
    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactor: false
    });

    const [resumeFile, setResumeFile] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login');
            } else {
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    contact: user.contact || '',
                    gender: user.gender || '',
                    location: user.location || '',
                    headline: user.headline || '',
                    skills: user.skills ? (Array.isArray(user.skills) ? user.skills.join(', ') : user.skills) : '',
                    profilePhoto: user.profilePhoto,
                    // New Fields Population
                    address: user.address || '',
                    tenth: user.education?.tenth || '',
                    twelfth: user.education?.twelfth || '',
                    sgpa: user.education?.sgpa || '',
                    github: user.social?.github || '',
                    linkedin: user.social?.linkedin || '',
                    portfolio: user.social?.portfolio || '',
                    about: user.about || '',
                    projects: user.stats?.projects || '',
                    happyClients: user.stats?.happyClients || '',
                    yearsExperience: user.stats?.yearsExperience || '',
                    awards: user.stats?.awards || ''
                });

                // If user has saved preferences, load them here (mocking for now)
                if (user.preferences && user.preferences.notifications) {
                    setNotifications(prev => ({ ...prev, ...user.preferences.notifications }));
                }
            }
        }
    }, [user, authLoading, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotifications(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSecurityChange = (e) => {
        const { id, value, type, checked } = e.target;
        setSecurity(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setAlert({ type: 'info', message: 'Saving changes...' });

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('contact', formData.contact);
        if (formData.gender) data.append('gender', formData.gender);
        data.append('location', formData.location);
        data.append('headline', formData.headline);
        data.append('skills', formData.skills);
        // New Fields Append
        data.append('address', formData.address);
        data.append('sgpa', formData.sgpa);

        // Sanitize URLs before sending
        data.append('github', ensureProtocol(formData.github));
        data.append('linkedin', ensureProtocol(formData.linkedin));
        data.append('portfolio', ensureProtocol(formData.portfolio));
        data.append('about', formData.about);
        data.append('projects', formData.projects);
        data.append('happyClients', formData.happyClients);
        data.append('yearsExperience', formData.yearsExperience);
        data.append('awards', formData.awards);

        const photoInput = document.getElementById('profilePhoto');
        if (photoInput && photoInput.files[0]) {
            data.append('profilePhoto', photoInput.files[0]);
        }

        try {
            const res = await api.put('/users/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setAlert({ type: 'success', message: 'Profile updated successfully!' });
                setUser(res.data.data); // Update global context
            } else {
                setAlert({ type: 'danger', message: res.data.error || 'Update failed' });
            }
        } catch (err) {
            setAlert({ type: 'danger', message: 'Something went wrong' });
        }
    };

    const handleSaveNotifications = async () => {
        setAlert({ type: 'info', message: 'Saving preferences...' });
        // Simulation of API call
        setTimeout(() => {
            setAlert({ type: 'success', message: 'Notification preferences saved!' });
        }, 800);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (security.newPassword !== security.confirmPassword) {
            setAlert({ type: 'danger', message: 'New passwords do not match' });
            return;
        }
        setAlert({ type: 'info', message: 'Updating password...' });
        // Simulation of API call
        setTimeout(() => {
            setAlert({ type: 'success', message: 'Password updated successfully!' });
            setSecurity(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        }, 1000);
    };

    if (authLoading || !user) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

    const renderTabButton = (id, icon, label) => (
        <button
            className={`tab-button ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
        >
            <i className={`fas fa-${icon}`}></i>
            <span>{label}</span>
        </button>
    );

    return (
        <main className="container page-content" style={{ paddingTop: '100px', paddingBottom: '4rem', background: '#f8fafc', maxWidth: '100%' }}>
            <div className="container">
                <div className="welcome-section reveal active" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#1e293b', fontWeight: 800, fontSize: '2.5rem', marginBottom: '0.5rem' }}>Profile <span style={{ color: '#6366f1' }}>Settings</span></h2>
                    <p style={{ color: '#64748b' }}>Manage your personal information, privacy, and security.</p>
                </div>

                {/* New Profile Card Design */}
                <ProfileCard user={user} />

                {/* Tabs */}
                <div className="settings-tabs-horizontal reveal active">
                    <div className="tabs-container">
                        {renderTabButton('personal', 'user', 'Personal Info')}
                        {renderTabButton('resume', 'file-alt', 'Resume')}
                        {renderTabButton('notifications', 'bell', 'Notifications')}
                        {renderTabButton('security', 'shield-alt', 'Security')}
                    </div>
                </div>

                {/* Alert Message */}
                {alert.message && (
                    <div className={`alert alert-${alert.type} reveal active`} style={{ marginBottom: '2rem' }}>
                        <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : 'info-circle'}`} style={{ marginRight: '0.5rem' }}></i>
                        {alert.message}
                    </div>
                )}

                {/* Content */}
                <div className="settings-content-modern reveal active">
                    {activeTab === 'personal' && (
                        <div className="tab-content active">
                            <section>
                                <div className="section-header">
                                    <h4 className="section-title"><i className="fas fa-user-edit"></i> Edit Profile</h4>
                                    <p className="section-description">Update your personal details and public profile information</p>
                                </div>

                                <form onSubmit={handleUpdateProfile}>
                                    <div className="profile-photo-upload mb-4">
                                        <div className="photo-wrapper">
                                            <img id="previewPhoto" src={user.profilePhoto || "https://via.placeholder.com/100"} alt="Profile" className="profile-photo" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />
                                            <label htmlFor="profilePhoto" className="photo-upload-label"><i className="fas fa-camera"></i></label>
                                            <input type="file" id="profilePhoto" className="hidden" accept="image/*" onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    const reader = new FileReader();
                                                    reader.onload = function (e) {
                                                        document.getElementById('previewPhoto').src = e.target.result;
                                                    }
                                                    reader.readAsDataURL(e.target.files[0]);
                                                }
                                            }} />
                                        </div>
                                        <div><h5 className="mb-1">Change Photo</h5><p className="text-muted mb-0">Max 5MB, JPG or PNG</p></div>
                                    </div>

                                    <div className="form-grid mb-3">
                                        <div className="form-group">
                                            <label htmlFor="name">Full Name</label>
                                            <input type="text" id="name" className="form-control" value={formData.name} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input type="email" id="email" className="form-control" value={formData.email} onChange={handleChange} required disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} title="Email cannot be changed directly" />
                                        </div>
                                    </div>

                                    <div className="form-grid mb-3">
                                        <div className="form-group">
                                            <label htmlFor="contact">Phone Number</label>
                                            <input type="text" id="contact" className="form-control" value={formData.contact} onChange={handleChange} placeholder="+91" />
                                        </div>
                                        <input type="text" id="location" className="form-control" value={formData.location} onChange={handleChange} placeholder="City, Country" />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label htmlFor="address">Full Address</label>
                                        <textarea id="address" className="form-control" value={formData.address} onChange={handleChange} placeholder="House No, Street, Area..." rows="2"></textarea>
                                    </div>

                                    {/* Education Section */}
                                    <h5 className="mb-3 mt-4" style={{ color: '#3b82f6' }}><i className="fas fa-graduation-cap"></i> Education Details</h5>
                                    <div className="form-grid mb-3">
                                        <div className="form-group">
                                            <label htmlFor="tenth">10th Percentage/CGPA</label>
                                            <input type="text" id="tenth" className="form-control" value={formData.tenth} onChange={handleChange} placeholder="e.g. 92%" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="twelfth">12th Percentage/CGPA</label>
                                            <input type="text" id="twelfth" className="form-control" value={formData.twelfth} onChange={handleChange} placeholder="e.g. 88%" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="sgpa">Current SGPA/CGPA</label>
                                            <input type="text" id="sgpa" className="form-control" value={formData.sgpa} onChange={handleChange} placeholder="e.g. 8.5" />
                                        </div>
                                    </div>

                                    {/* Social Links Section */}
                                    <h5 className="mb-3 mt-4" style={{ color: '#3b82f6' }}><i className="fas fa-link"></i> Social Profiles</h5>
                                    <div className="form-grid mb-3">
                                        <div className="form-group">
                                            <label htmlFor="github">GitHub URL</label>
                                            <input type="text" id="github" className="form-control" value={formData.github} onChange={handleChange} placeholder="https://github.com/..." />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="linkedin">LinkedIn URL</label>
                                            <input type="text" id="linkedin" className="form-control" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="portfolio">Portfolio/Website</label>
                                            <input type="text" id="portfolio" className="form-control" value={formData.portfolio} onChange={handleChange} placeholder="https://myportfolio.com" />
                                        </div>
                                    </div>

                                    {/* Professional Summary & Stats */}
                                    <h5 className="mb-3 mt-4" style={{ color: '#3b82f6' }}><i className="fas fa-briefcase"></i> Professional Details</h5>

                                    <div className="form-group mb-3">
                                        <label htmlFor="about">Professional Summary</label>
                                        <textarea id="about" className="form-control" value={formData.about} onChange={handleChange} placeholder="Passionate and results-driven..." rows="4"></textarea>
                                    </div>

                                    <h6 className="mb-2 mt-3" style={{ color: '#64748b' }}>Key Statistics</h6>
                                    <div className="form-grid mb-3">
                                        <div className="form-group">
                                            <label htmlFor="projects">Projects (e.g. 50+)</label>
                                            <input type="text" id="projects" className="form-control" value={formData.projects} onChange={handleChange} placeholder="50+" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="happyClients">Happy Clients (e.g. 30+)</label>
                                            <input type="text" id="happyClients" className="form-control" value={formData.happyClients} onChange={handleChange} placeholder="30+" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="yearsExperience">Years Exp. (e.g. 5+)</label>
                                            <input type="text" id="yearsExperience" className="form-control" value={formData.yearsExperience} onChange={handleChange} placeholder="5+" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="awards">Awards (e.g. 12)</label>
                                            <input type="text" id="awards" className="form-control" value={formData.awards} onChange={handleChange} placeholder="12" />
                                        </div>
                                    </div>

                                    {/* Display Resume Link in Personal Info if available */}
                                    {user.resume && (
                                        <div className="form-group mb-4" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px border #e2e8f0' }}>
                                            <label className="d-block mb-2" style={{ fontWeight: 600, color: '#3b82f6' }}><i className="fas fa-file-alt"></i> Selected Resume</label>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b', fontSize: '0.95rem' }}><i className="fas fa-check" style={{ color: '#16a34a', marginRight: '0.5rem' }}></i> Resume Uploaded</span>
                                                <a href={user.resume} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    View / Download <i className="fas fa-external-link-alt" style={{ marginLeft: '4px' }}></i>
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group mb-3">
                                        <label htmlFor="headline">Professional Headline</label>
                                        <input type="text" id="headline" className="form-control" value={formData.headline} onChange={handleChange} placeholder="e.g. Senior Frontend Developer" />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="skills">Skills (Comma separated)</label>
                                        <input type="text" id="skills" className="form-control" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Design..." />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Save Changes</button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    )}

                    {activeTab === 'resume' && (
                        <div className="tab-content active">
                            <section>
                                <div className="section-header">
                                    <h4 className="section-title"><i className="fas fa-file-alt"></i> Resume Management</h4>
                                    <p className="section-description">Upload and manage your CV to apply for jobs faster.</p>
                                </div>
                                <div className="form-group mb-4" style={{ padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
                                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                                    <h5>Upload new Resume</h5>
                                    <p className="text-muted">Supported formats: PDF, DOCX (Max 10MB)</p>

                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        id="resumeInput"
                                        style={{ display: 'none' }}
                                        onChange={(e) => setResumeFile(e.target.files[0])}
                                    />
                                    <button
                                        className="btn btn-outline"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => document.getElementById('resumeInput').click()}
                                    >
                                        {resumeFile ? resumeFile.name : 'Browse Files'}
                                    </button>
                                    {resumeFile && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={async () => {
                                                    if (!resumeFile) return;
                                                    setAlert({ type: 'info', message: 'Uploading resume...' });

                                                    const data = new FormData();
                                                    // Append all existing form data to prevent overwriting with undefined
                                                    Object.keys(formData).forEach(key => {
                                                        // Filter out empty valus for enum fields to avoid validation errors
                                                        if (key === 'gender' && !formData[key]) return;
                                                        data.append(key, formData[key]);
                                                    });
                                                    data.append('resume', resumeFile);

                                                    try {
                                                        const res = await api.put('/users/profile', data, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        if (res.data.success) {
                                                            setAlert({ type: 'success', message: 'Resume uploaded successfully!' });
                                                            setUser(res.data.data);
                                                            setResumeFile(null);
                                                        } else {
                                                            setAlert({ type: 'danger', message: res.data.error || 'Upload failed' });
                                                        }
                                                    } catch (err) {
                                                        console.error("Resume upload error:", err);
                                                        const errorMsg = err.response && err.response.data && err.response.data.error
                                                            ? err.response.data.error
                                                            : 'Something went wrong during upload.';
                                                        setAlert({ type: 'danger', message: errorMsg });
                                                    }
                                                }}
                                            >
                                                Upload Selected File
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {user.resume && (
                                    <div className="resume-card-modern reveal active" style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                                        borderRadius: '16px',
                                        border: '1px solid #dbeafe',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                background: '#ffffff',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}>
                                                <i className="fas fa-file-pdf" style={{ fontSize: '1.8rem', color: '#ef4444' }}></i>
                                            </div>
                                            <div>
                                                <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>Current Resume.pdf</h5>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                                    <i className="fas fa-check-circle" style={{ color: '#16a34a', marginRight: '0.4rem' }}></i>
                                                    Ready for applications
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <a
                                                href={user.resume}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-primary"
                                                style={{
                                                    padding: '0.6rem 1.5rem',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)'
                                                }}
                                            >
                                                <i className="fas fa-eye"></i> View Resume
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="tab-content active">
                            <section>
                                <div className="section-header">
                                    <h4 className="section-title"><i className="fas fa-bell"></i> Notification Preferences</h4>
                                    <p className="section-description">Choose how you want to be notified about updates.</p>
                                </div>

                                <div className="notification-list">
                                    <div className="notification-item">
                                        <div className="notification-info">
                                            <h5>Email Alerts</h5>
                                            <p>Receive emails about your account activity.</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" name="emailAlerts" checked={notifications.emailAlerts} onChange={handleNotificationChange} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="notification-item">
                                        <div className="notification-info">
                                            <h5>Job Recommendations</h5>
                                            <p>Get personalized job picks based on your profile.</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" name="jobRecommendations" checked={notifications.jobRecommendations} onChange={handleNotificationChange} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="notification-item">
                                        <div className="notification-info">
                                            <h5>Push Notifications</h5>
                                            <p>Receive push notifications on your device.</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" name="pushNotifications" checked={notifications.pushNotifications} onChange={handleNotificationChange} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="notification-item">
                                        <div className="notification-info">
                                            <h5>Marketing Emails</h5>
                                            <p>Receive offers, newsletters, and feature updates.</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" name="marketingEmails" checked={notifications.marketingEmails} onChange={handleNotificationChange} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-primary" onClick={handleSaveNotifications}>Save Preferences</button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="tab-content active">
                            <section>
                                <div className="section-header">
                                    <h4 className="section-title"><i className="fas fa-shield-alt"></i> Security Settings</h4>
                                    <p className="section-description">Manage your password and account security.</p>
                                </div>

                                <form onSubmit={handleUpdatePassword}>
                                    <div className="form-group mb-4">
                                        <label htmlFor="currentPassword">Current Password</label>
                                        <input type="password" id="currentPassword" className="form-control" value={security.currentPassword} onChange={handleSecurityChange} />
                                    </div>
                                    <div className="form-grid mb-4">
                                        <div className="form-group">
                                            <label htmlFor="newPassword">New Password</label>
                                            <input type="password" id="newPassword" className="form-control" value={security.newPassword} onChange={handleSecurityChange} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirmPassword">Confirm New Password</label>
                                            <input type="password" id="confirmPassword" className="form-control" value={security.confirmPassword} onChange={handleSecurityChange} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                                        <button type="submit" className="btn btn-primary">Update Password</button>
                                    </div>
                                </form>

                                <div className="section-header" style={{ marginTop: '3rem' }}>
                                    <h4 className="section-title"><i className="fas fa-lock"></i> Two-Factor Authentication</h4>
                                    <p className="section-description">Add an extra layer of security to your account.</p>
                                </div>

                                <div className="notification-item">
                                    <div className="notification-info">
                                        <h5>Enable Two-Factor Authentication (2FA)</h5>
                                        <p>Protect your account with SMS or Authenticator App.</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" id="twoFactor" checked={security.twoFactor} onChange={handleSecurityChange} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </section>
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
};

export default Profile;
