import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployerNav from './EmployerNav';
import api from '../services/api';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (user) {
                try {
                    const res = await api.get('/notifications');
                    if (res.data.success) {
                        setNotifications(res.data.data);
                    }
                } catch (err) {
                    console.error('Failed to fetch notifications', err);
                }
            }
        };
        fetchNotifications();

        // Polling for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="container">
                <nav className="navbar">
                    <div className="logo">
                        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                            <img src="/images/logo.svg" alt="JobLoom" style={{ height: '40px' }} />
                        </Link>
                    </div>
                    <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
                        {useLocation().pathname !== '/dashboard-seeker' && useLocation().pathname !== '/dashboard-employer' && useLocation().pathname !== '/post-job' && useLocation().pathname !== '/applications' && useLocation().pathname !== '/profile' && useLocation().pathname !== '/network' && (
                            <li><Link to="/">Home</Link></li>
                        )}
                        {useLocation().pathname !== '/dashboard-seeker' && useLocation().pathname !== '/dashboard-employer' && useLocation().pathname !== '/post-job' && useLocation().pathname !== '/network' && useLocation().pathname !== '/applications' && useLocation().pathname !== '/profile' && (
                            <li><Link to="/about">About</Link></li>
                        )}
                        {useLocation().pathname !== '/dashboard-employer' && useLocation().pathname !== '/post-job' && useLocation().pathname !== '/dashboard-seeker' && useLocation().pathname !== '/network' && useLocation().pathname !== '/applications' && useLocation().pathname !== '/profile' && (
                            <>
                                <li><Link to="/jobs">Find Jobs</Link></li>
                                <li><Link to="/verify-certificate">Verify Cert</Link></li>
                            </>
                        )}
                        {(useLocation().pathname === '/dashboard-employer' || useLocation().pathname === '/post-job') && (
                            <EmployerNav />
                        )}
                        {user ? (
                            <>
                                {user?.role === 'recruiter' || user?.role === 'employer' ? (
                                    <>
                                        {useLocation().pathname !== '/dashboard-employer' && useLocation().pathname !== '/post-job' && (
                                            <li><Link to="/dashboard-employer">Dashboard</Link></li>
                                        )}
                                    </>
                                ) : user?.role === 'admin' ? (
                                    <li><Link to="/admin-dashboard">Admin</Link></li>
                                ) : (
                                    <>
                                        {useLocation().pathname !== '/about' && useLocation().pathname !== '/jobs' && useLocation().pathname !== '/verify-certificate' && (
                                            <li><Link to="/dashboard-seeker">Seeker Zone</Link></li>
                                        )}
                                        {(useLocation().pathname === '/dashboard-seeker' || useLocation().pathname === '/network' || useLocation().pathname === '/applications' || useLocation().pathname === '/profile') && (
                                            <li><Link to="/network">Network</Link></li>
                                        )}
                                        {useLocation().pathname !== '/' && useLocation().pathname !== '/about' && useLocation().pathname !== '/jobs' && useLocation().pathname !== '/verify-certificate' && (
                                            <>
                                                <li><Link to="/applications">Applications</Link></li>
                                                <li><Link to="/profile">Profile</Link></li>
                                            </>
                                        )}
                                    </>
                                )}
                                <li>
                                    <div className="header-actions" style={{ position: 'relative', marginRight: '1rem' }} ref={notifRef}>
                                        <button
                                            onClick={() => setShowNotifications(!showNotifications)}
                                            style={{
                                                background: showNotifications ? '#eff6ff' : 'transparent',
                                                border: 'none',
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                cursor: 'pointer',
                                                color: showNotifications ? '#4f46e5' : '#64748b',
                                                transition: 'all 0.2s',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '40px',
                                                height: '40px'
                                            }}
                                        >
                                            <i className="fas fa-bell" style={{ fontSize: '1.2rem' }}></i>
                                            {unreadCount > 0 && (
                                                <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', border: '2px solid white', width: '10px', height: '10px', borderRadius: '50%' }}></span>
                                            )}
                                        </button>

                                        {showNotifications && (
                                            <div className="glass-card animate-fade-in" style={{ position: 'absolute', top: '120%', right: -50, width: '380px', maxHeight: '500px', overflowY: 'auto', padding: '0', zIndex: 100, background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
                                                <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Notifications</h4>
                                                    <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>{unreadCount} New</span>
                                                </div>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                                                        <i className="fas fa-bell-slash" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                                                        <p style={{ margin: 0, color: '#94a3b8' }}>You're all caught up!</p>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        {notifications.map(notif => (
                                                            <div key={notif._id} onClick={() => handleMarkAsRead(notif._id)} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', background: notif.isRead ? 'white' : '#f0f9ff', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                                <div style={{ marginTop: '0.25rem', color: notif.type === 'interview' ? '#8b5cf6' : '#3b82f6', background: notif.type === 'interview' ? '#f3e8ff' : '#dbeafe', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                                                                    <i className={`fas ${notif.type === 'interview' ? 'fa-video' : 'fa-envelope'}`} style={{ fontSize: '0.9rem' }}></i>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#1e293b', fontWeight: notif.isRead ? 400 : 600 }}>{notif.title}</p>
                                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>{notif.message}</p>
                                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                {!notif.isRead && (
                                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '0.5rem' }}></div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </li>
                                <li>
                                    <UserDropdown user={user} handleLogout={handleLogout} />
                                </li>
                            </>
                        ) : (
                            <>
                                {useLocation().pathname !== '/dashboard-employer' && useLocation().pathname !== '/post-job' && (
                                    <>
                                        <li><Link to="/login">Login</Link></li>
                                        <li><Link to="/register">Sign Up</Link></li>
                                        <li className="recruiter-link"><Link to="/recruiter-register">Post a Job</Link></li>
                                    </>
                                )}
                            </>
                        )}
                    </ul>
                    <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </nav>
            </div>
        </header>
    );
};

const UserDropdown = ({ user, handleLogout }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Toggle dropdown
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="nav-user-dropdown-container" ref={dropdownRef}>
            <button
                className="nav-user-avatar-btn"
                onClick={toggleDropdown}
                title="Account Settings"
            >
                {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} />
                ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
            </button>

            <div className={`nav-dropdown-menu ${isDropdownOpen ? 'active' : ''}`}>
                <div className="nav-dropdown-header">
                    <span className="nav-user-name">{user?.name}</span>
                    <span className="nav-user-email">{user?.email || 'user@example.com'}</span>
                </div>


                <Link to="/profile" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)} target="_blank">
                    <i className="fas fa-cog"></i> Settings
                </Link>

                <div className="nav-dropdown-divider"></div>

                <button onClick={handleLogout} className="nav-dropdown-item logout">
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
