import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
// Image import removed to fix build error. Gradient used instead.

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AnalyticsTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/analytics');
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: '50px', height: '50px', border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: '600' }}>Gathering Insights...</h3>
            <p style={{ color: '#64748b' }}>Analyzing your recruitment pipeline data.</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!data) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}><i className="fas fa-exclamation-triangle"></i></div>
            <h3 style={{ color: '#1e293b' }}>Failed to load analytics</h3>
            <p style={{ color: '#64748b' }}>Please try refreshing the page or contact support.</p>
        </div>
    );

    const { overview, trends, statusDistribution, jobPerformance } = data;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem', marginTop:'5rem' , marginLeft:'-10rem', width: '1600px' }}>

            {/* Premium Full Width Hero Poster */}
            <div className="analytics-hero" style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
                borderRadius: '0 0 40px 40px',
                padding: '4rem 2rem 8rem 2rem',
                color: 'white',
                marginBottom: '4rem',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.1) 0%, transparent 20%)',
                    zIndex: 0
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <i className="fas fa-sparkles" style={{ color: '#fbbf24', marginRight: '0.5rem' }}></i> Intelligence Hub
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, white, #e0e7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        Recruitment Analytics
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#c7d2fe', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Deep dive into your hiring performance. Track applications, monitor conversion rates, and optimize your recruitment strategy in real-time.
                    </p>
                </div>
            </div>

            {/* Floating Stats Area */}
            <div className="container" style={{ maxWidth: '1400px', margin: '-7rem auto 3rem', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    <StatCard
                        title="Total Active Jobs"
                        value={overview.totalJobs}
                        icon="briefcase"
                        color="#ffffff"
                        bg="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                        trend="+2 this month"
                    />
                    <StatCard
                        title="Total Applications"
                        value={overview.totalApplications}
                        icon="file-signature"
                        color="#ffffff"
                        bg="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                        trend="+12% growth"
                    />
                    <StatCard
                        title="Candidates Hired"
                        value={overview.hiredCount}
                        icon="user-check"
                        color="#ffffff"
                        bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        trend="Top tier talent"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${overview.totalApplications ? ((overview.hiredCount / overview.totalApplications) * 100).toFixed(1) : 0}%`}
                        icon="chart-pie"
                        color="#ffffff"
                        bg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        trend="Hiring efficiency"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>

                    {/* Chart: Application Trends (Wide) */}
                    <div className="glass-card full-span-mobile" style={{ gridColumn: 'span 8', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem 0' }}>Application & Hiring Trends</h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Overview of application volume vs hires over the last 6 months</p>
                            </div>
                            <select style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>
                                <option>Last 6 Months</option>
                                <option>This Year</option>
                            </select>
                        </div>

                        <div style={{ height: '350px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', padding: '15px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }}
                                        itemStyle={{ paddingBottom: '5px' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '5px' }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '10px' }} />
                                    <Area type="monotone" name="Applications" dataKey="applications" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                                    <Area type="monotone" name="Hired" dataKey="hired" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHired)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart: Pipeline Status (Narrow) */}
                    <div className="glass-card full-span-mobile" style={{ gridColumn: 'span 4', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem 0' }}>Pipeline Distribution</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Current status of all active applications</p>
                        </div>

                        <div style={{ flex: 1, minHeight: '300px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={5}
                                    >
                                        {statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', padding: '10px 15px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: '600' }}
                                    />
                                    <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}
                                    />
                                    {/* Center Text */}
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                        <tspan x="42%" y="47%" fill="#64748b" fontSize="14" fontWeight="500">Total</tspan>
                                        <tspan x="42%" y="55%" fill="#1e293b" fontSize="24" fontWeight="800">{overview.totalApplications}</tspan>
                                    </text>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart: Job Performance (Full Row) */}
                    <div className="glass-card" style={{ gridColumn: 'span 12', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem 0' }}>Top Performing Jobs</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Jobs receiving the highest engagement and application volume</p>
                        </div>

                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={jobPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={30}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={180} tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', padding: '15px', color: 'white' }}
                                    />
                                    <Bar dataKey="value" name="Applications" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                                        {jobPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .full-span-mobile {
                        grid-column: span 12 !important;
                    }
                    .analytics-hero {
                        padding: 3rem 1.5rem 6rem 1.5rem !important;
                        margin-bottom: 2rem !important;
                    }
                    .analytics-hero h1 {
                        font-size: 2rem !important;
                    }
                    .container {
                        padding: 0 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, color, bg, trend }) {
    return (
        <div className="stat-card" style={{
            background: bg,
            borderRadius: '24px',
            padding: '1.75rem',
            color: 'white',
            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255,255,255,0.1)',
            transition: 'transform 0.3s ease',
            cursor: 'default',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    <i className={`fas fa-${icon}`}></i>
                </div>
                {trend && (
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '50px', backdropFilter: 'blur(5px)' }}>
                        {trend}
                    </span>
                )}
            </div>

            <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '0.25rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{value}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '500', opacity: 0.9 }}>{title}</div>
            </div>
        </div>
    );
}
