import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const EmployerNav = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    return (
        <>
            <NavTabButton to="/dashboard-employer?tab=dashboard" active={activeTab === 'dashboard'} label="Overview" />
            <NavTabButton to="/dashboard-employer?tab=analytics" active={activeTab === 'analytics'} label="Analytics" />
            <NavTabButton to="/dashboard-employer?tab=messages" active={activeTab === 'messages'} label="Messages" />
            <NavTabButton to="/dashboard-employer?tab=jobs" active={activeTab === 'jobs'} label="My Jobs" />

            <NavTabButton to="/dashboard-employer?tab=candidates" active={activeTab === 'candidates'} label="Candidates" />
            <NavTabButton to="/dashboard-employer?tab=import" active={activeTab === 'import'} label="Import Data" />
            <NavTabButton to="/dashboard-employer?tab=settings" active={activeTab === 'settings'} label="Settings" />
        </>
    );
};

function NavTabButton({ to, active, label }) {
    return (
        <li>
            <Link
                to={to}
                className={active ? 'active' : ''}
                style={{
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {label}
            </Link>
        </li>
    );
}

export default EmployerNav;
