import React, { useState, useEffect } from 'react';
import { adminApi } from '../context/AdminAuthContext';
import { Users, Briefcase, Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [pendingStats, setPendingStats] = useState(null);
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, bookingsRes, pendingRes] = await Promise.all([
                    adminApi.get('/admin/dashboard'),
                    adminApi.get('/admin/bookings'),
                    adminApi.get('/admin/stats/pending'),
                ]);

                if (statsRes.data && statsRes.data.stats) {
                    setStats(statsRes.data.stats);
                }
                if (bookingsRes.data && bookingsRes.data.bookings) {
                    setBookings(bookingsRes.data.bookings.slice(0, 5));
                }
                if (pendingRes.data) {
                    setPendingStats(pendingRes.data.stats);
                    setWeeklyData(pendingRes.data.weeklyData || []);
                }
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading stats...</p>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: <DollarSign size={20} className="text-success" />, accent: 'var(--success)' },
        { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: <Calendar size={20} className="text-info" />, accent: 'var(--info)' },
        { title: 'Completed Jobs', value: stats?.completedBookings || 0, icon: <CheckCircle size={20} className="text-success" />, accent: 'var(--success)' },
        { title: 'Pending Bookings', value: pendingStats?.pendingBookings || 0, icon: <Clock size={20} className="text-warning" />, accent: 'var(--warning)' },
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={20} className="text-warning" />, accent: 'var(--warning)' },
        { title: 'Service Providers', value: stats?.totalProviders || 0, icon: <Briefcase size={20} className="text-info" />, accent: 'var(--info)' },
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed': return 'completed';
            case 'accepted': return 'accepted';
            case 'in_progress': return 'in-progress';
            case 'pending': return 'pending';
            case 'cancelled': return 'cancelled';
            default: return '';
        }
    };

    // Calculate max for chart scaling
    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

    return (
        <div>
            {/* Stats Grid */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {statCards.map((card, idx) => (
                    <div key={idx} className="stat-card" style={{ borderLeft: `4px solid ${card.accent}` }}>
                        <div className="stat-header">
                            <span className="stat-title">{card.title}</span>
                            <div className="stat-icon">{card.icon}</div>
                        </div>
                        <span className="stat-value">{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Weekly Bookings Chart */}
            <div className="card-panel" style={{ marginTop: '24px' }}>
                <div className="card-panel-header">
                    <h2 className="panel-title">Weekly Booking Trends</h2>
                </div>
                <div style={{ padding: '20px 24px 24px', display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
                    {weeklyData.map((day, idx) => {
                        const barHeight = maxCount > 0 ? (day.count / maxCount) * 140 : 0;
                        return (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{day.count}</span>
                                <div style={{
                                    width: '100%',
                                    maxWidth: '48px',
                                    height: `${Math.max(barHeight, 4)}px`,
                                    background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))',
                                    borderRadius: '8px 8px 4px 4px',
                                    transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                    minHeight: '4px',
                                }} />
                                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>{day.day}</span>
                            </div>
                        );
                    })}
                    {weeklyData.length === 0 && (
                        <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-secondary)', paddingTop: '60px' }}>
                            No booking data available yet
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Bookings Panel */}
            <div className="card-panel" style={{ marginTop: '24px' }}>
                <div className="card-panel-header">
                    <h2 className="panel-title">Recent Booking Activities</h2>
                </div>

                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Customer</th>
                                <th>Provider</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td style={{ fontWeight: 600 }}>{booking.serviceName}</td>
                                        <td>{booking.customerId?.name || booking.customerName || 'N/A'}</td>
                                        <td>{booking.providerId?.name || 'Searching...'}</td>
                                        <td style={{ fontWeight: 600 }}>₹{booking.amount}</td>
                                        <td>
                                            <span className={`badge-status ${getStatusClass(booking.status)}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{new Date(booking.scheduledDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No recent bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
