import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data.success && res.data.data.role !== 'admin') {
                    navigate('/login');
                }
            } catch (err) {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        checkAdmin();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;

    return (
        <main className="container page-content" style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
            <div className="section-title">
                <h2>Admin Dashboard</h2>
                <p>Welcome to the admin panel.</p>
            </div>

            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <i className="fas fa-tools" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                <h3>Admin Features</h3>
                <p style={{ color: '#64748b' }}>Select a module from the navigation to manage the platform.</p>
            </div>
        </main>
    );
};

export default AdminDashboard;
