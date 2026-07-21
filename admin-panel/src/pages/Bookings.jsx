import React, { useState, useEffect } from 'react';
import { adminApi } from '../context/AdminAuthContext';
import { Search } from 'lucide-react';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await adminApi.get('/admin/bookings');
            if (response.data && response.data.bookings) {
                setBookings(response.data.bookings);
            }
        } catch (err) {
            console.error('Failed to load bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusChange = async (bookingId, newStatus) => {
        setActionLoading(bookingId);
        try {
            const response = await adminApi.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
            if (response.data.success) {
                setBookings(bookings.map(b => 
                    b.id === bookingId ? { ...b, status: newStatus } : b
                ));
            }
        } catch (err) {
            console.error('Failed to update booking status:', err);
            alert('Failed to update booking status.');
        } finally {
            setActionLoading(null);
        }
    };

    const getFilteredBookings = () => {
        return bookings.filter(booking => {
            const customerName = booking.customerId?.name || booking.customerName || '';
            const providerName = booking.providerId?.name || '';
            const serviceName = booking.serviceName || '';

            const matchesSearch = 
                customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                serviceName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    };

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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading bookings...</p>
            </div>
        );
    }

    const filteredBookings = getFilteredBookings();

    return (
        <div className="card-panel">
            <div className="card-panel-header" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
                <h2 className="panel-title" style={{ marginRight: 'auto' }}>Bookings Ledger</h2>
                
                {/* Search & Filters */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search service, customer, provider..."
                            className="form-input"
                            style={{ paddingLeft: '40px', width: '280px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span style={{ position: 'absolute', left: '14px', top: '12px', opacity: 0.5 }}>
                            <Search size={18} />
                        </span>
                    </div>

                    <select
                        className="form-select"
                        style={{ width: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Service</th>
                            <th>Customer Info</th>
                            <th>Provider Name</th>
                            <th>Schedule Date</th>
                            <th>Time</th>
                            <th>Billing</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Admin Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td style={{ fontSize: '12px', opacity: 0.6 }}>#{booking.id.slice(-6).toUpperCase()}</td>
                                    <td style={{ fontWeight: 600 }}>{booking.serviceName}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{booking.customerId?.name || booking.customerName || 'N/A'}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            {booking.customerId?.phone || booking.customerPhone || 'No phone'}
                                        </div>
                                    </td>
                                    <td>{booking.providerId?.name || <span style={{ opacity: 0.5 }}>Searching...</span>}</td>
                                    <td>{new Date(booking.scheduledDate).toLocaleDateString()}</td>
                                    <td>{booking.scheduledTime}</td>
                                    <td style={{ fontWeight: 600 }}>₹{booking.amount}</td>
                                    <td>
                                        <span className={`badge-status ${getStatusClass(booking.status)}`}>
                                            {booking.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                width: '130px', 
                                                fontSize: '12px', 
                                                padding: '6px 10px',
                                                cursor: 'pointer',
                                                opacity: actionLoading === booking.id ? 0.5 : 1,
                                            }}
                                            value={booking.status}
                                            disabled={actionLoading === booking.id}
                                            onChange={(e) => {
                                                if (e.target.value !== booking.status) {
                                                    if (window.confirm(`Change status to "${e.target.value.replace('_', ' ')}"?`)) {
                                                        handleStatusChange(booking.id, e.target.value);
                                                    } else {
                                                        e.target.value = booking.status;
                                                    }
                                                }
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No bookings found matching current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
