import React, { useState, useEffect } from 'react';
import { adminApi } from '../context/AdminAuthContext';
import { Search, ShieldCheck, ShieldX, X } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await adminApi.get('/admin/users');
            if (response.data && response.data.users) {
                setUsers(response.data.users);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId, currentStatus) => {
        setActionLoading(true);
        try {
            const nextStatus = !currentStatus;
            const response = await adminApi.put(`/admin/users/${userId}/status`, { isActive: nextStatus });
            if (response.data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, isActive: nextStatus } : u));
                // Update selected user if open in modal
                if (selectedUser && selectedUser._id === userId) {
                    setSelectedUser(prev => ({ ...prev, isActive: nextStatus }));
                }
            }
        } catch (err) {
            console.error('Failed to toggle user status:', err);
            alert('Failed to update user status.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleApproval = async (userId, currentApproval) => {
        setActionLoading(true);
        try {
            const nextApproval = !currentApproval;
            const response = await adminApi.put(`/admin/providers/${userId}/approve`, { isApproved: nextApproval });
            if (response.data.success) {
                setUsers(users.map(u => {
                    if (u._id === userId) {
                        return {
                            ...u,
                            providerDetails: {
                                ...u.providerDetails,
                                isApproved: nextApproval
                            }
                        };
                    }
                    return u;
                }));
                // Update selected user if open in modal
                if (selectedUser && selectedUser._id === userId) {
                    setSelectedUser(prev => ({
                        ...prev,
                        providerDetails: {
                            ...prev.providerDetails,
                            isApproved: nextApproval
                        }
                    }));
                }
            }
        } catch (err) {
            console.error('Failed to toggle provider approval:', err);
            alert('Failed to update provider approval.');
        } finally {
            setActionLoading(false);
        }
    };

    const getFilteredUsers = () => {
        return users.filter(user => {
            const matchesSearch = 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.phone && user.phone.includes(searchTerm));
            
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    const filteredUsers = getFilteredUsers();

    return (
        <div className="card-panel">
            <div className="card-panel-header" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
                <h2 className="panel-title" style={{ marginRight: 'auto' }}>User Directories</h2>
                
                {/* Search & Filters */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search name, email, phone..."
                            className="form-input"
                            style={{ paddingLeft: '40px', width: '260px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span style={{ position: 'absolute', left: '14px', top: '12px', opacity: 0.5 }}>
                            <Search size={18} />
                        </span>
                    </div>

                    <select
                        className="form-select"
                        style={{ width: '140px' }}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="customer">Customers</option>
                        <option value="provider">Providers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Provider</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td style={{ fontWeight: 600 }}>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td style={{ textTransform: 'capitalize' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '6px', 
                                            fontSize: '12px', 
                                            fontWeight: 500,
                                            background: user.role === 'admin' ? 'var(--error-glow)' : user.role === 'provider' ? 'var(--info-glow)' : 'var(--accent-glow)',
                                            color: user.role === 'admin' ? 'var(--error)' : user.role === 'provider' ? 'var(--info)' : 'var(--accent-primary)'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge-status ${user.isActive ? 'active' : 'inactive'}`}>
                                            {user.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role === 'provider' ? (
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                background: user.providerDetails?.isApproved ? '#dcfce7' : '#fef3c7',
                                                color: user.providerDetails?.isApproved ? '#16a34a' : '#d97706',
                                            }}>
                                                {user.providerDetails?.isApproved ? '✓ Approved' : '⏳ Pending'}
                                            </span>
                                        ) : (
                                            <span style={{ opacity: 0.3, fontSize: '13px' }}>—</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="status-action-btn"
                                                style={{ 
                                                    background: 'rgba(255, 255, 255, 0.05)', 
                                                    color: 'var(--text-secondary)',
                                                    border: '1px solid var(--border-color)',
                                                }}
                                                title="View details & verification"
                                            >
                                                Details
                                            </button>
                                            {user.role === 'provider' && (
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleToggleApproval(user._id, user.providerDetails?.isApproved)}
                                                    className={`status-action-btn ${user.providerDetails?.isApproved ? 'deactivate' : 'active'}`}
                                                    title={user.providerDetails?.isApproved ? 'Revoke Approval' : 'Approve Provider'}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    {user.providerDetails?.isApproved ? (
                                                        <><ShieldX size={14} /> Revoke</>
                                                    ) : (
                                                        <><ShieldCheck size={14} /> Approve</>
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                className={`status-action-btn ${user.isActive ? 'deactivate' : 'active'}`}
                                            >
                                                {user.isActive ? 'Suspend' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No users found matching current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div 
                        className="admin-modal" 
                        style={{ width: '680px', maxWidth: '95%', display: 'flex', flexDirection: 'column' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                            <h3 className="modal-header" style={{ margin: 0 }}>
                                {selectedUser.role === 'provider' ? 'Shop & Service Provider Details' : 'Customer Account Details'}
                            </h3>
                            <button 
                                onClick={() => setSelectedUser(null)} 
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '8px' }}>
                            
                            {/* Shop Banner Image for Providers */}
                            {selectedUser.role === 'provider' && selectedUser.providerDetails?.bannerImage && (
                                <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                                    <img 
                                        src={selectedUser.providerDetails.bannerImage} 
                                        alt="Shop Banner" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ 
                                        position: 'absolute', 
                                        bottom: '12px', 
                                        left: '12px', 
                                        background: 'rgba(11, 8, 19, 0.8)', 
                                        padding: '4px 10px', 
                                        borderRadius: '6px', 
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#38bdf8',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {selectedUser.providerDetails?.shopName || 'Service Provider'}
                                    </div>
                                </div>
                            )}

                            {/* User Header Section */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img 
                                    src={selectedUser.profileImage || `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#3b82f6"/><text x="50" y="58" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">U</text></svg>')}`} 
                                    alt={selectedUser.name} 
                                    style={{ width: '64px', height: '64px', borderRadius: '12px', border: '1px solid var(--border-color)', objectFit: 'cover' }}
                                />
                                <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                        {selectedUser.name}
                                    </h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>{selectedUser.email}</p>
                                    <span style={{ 
                                        display: 'inline-block',
                                        marginTop: '8px',
                                        padding: '2px 8px', 
                                        borderRadius: '6px', 
                                        fontSize: '11px', 
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        background: selectedUser.role === 'admin' ? 'var(--error-glow)' : selectedUser.role === 'provider' ? 'var(--info-glow)' : 'var(--accent-glow)',
                                        color: selectedUser.role === 'admin' ? 'var(--error)' : selectedUser.role === 'provider' ? 'var(--info)' : 'var(--accent-primary)'
                                    }}>
                                        {selectedUser.role}
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Phone Number</label>
                                    <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                        {selectedUser.phone || 'Not Available'}
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Status</label>
                                    <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                        {selectedUser.isActive ? 'Active' : 'Suspended'}
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Address / Location</label>
                                <div className="form-input" style={{ height: 'auto', background: 'var(--bg-tertiary)', padding: '16px', lineHeight: '1.6' }}>
                                    {selectedUser.address ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {selectedUser.address.street && <div><strong>Street:</strong> {selectedUser.address.street}</div>}
                                            {selectedUser.address.city && <div><strong>City:</strong> {selectedUser.address.city}</div>}
                                            {selectedUser.address.state && <div><strong>State:</strong> {selectedUser.address.state}</div>}
                                            {selectedUser.address.pincode && <div><strong>Pincode:</strong> {selectedUser.address.pincode}</div>}
                                            {selectedUser.address.coordinates && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                                                    📍 Coordinates: Lat {selectedUser.address.coordinates.lat}, Lng {selectedUser.address.coordinates.lng}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        'No address provided'
                                    )}
                                </div>
                            </div>

                            {/* Provider Details Block */}
                            {selectedUser.role === 'provider' && (
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Business & Shop Details</h4>
                                    
                                    {/* Shop & Owner Name */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Shop / Business Name</label>
                                            <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                                {selectedUser.providerDetails?.shopName || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Owner Name</label>
                                            <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                                {selectedUser.providerDetails?.ownerName || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shop Description */}
                                    {selectedUser.providerDetails?.description && (
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Business Description</label>
                                            <div className="form-input" style={{ height: 'auto', background: 'var(--bg-tertiary)', padding: '14px', lineHeight: '1.5' }}>
                                                {selectedUser.providerDetails.description}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timings & Off Days */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Working Hours</label>
                                            <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                                {selectedUser.providerDetails?.workingHours || '9:00 AM - 8:00 PM'}
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Weekly Off</label>
                                            <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                                {selectedUser.providerDetails?.weeklyOff || 'None'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Payout details */}
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">UPI ID (For Payouts / Settlement)</label>
                                        <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center', fontWeight: 600, color: 'var(--success)' }}>
                                            {selectedUser.providerDetails?.upiId || 'Not setup'}
                                        </div>
                                    </div>

                                    {/* Registration & GST Numbers */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">GST Number (GSTIN)</label>
                                            <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                                                {selectedUser.providerDetails?.gstNumber || 'Unregistered'}
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Business Registration Number</label>
                                            <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                                                {selectedUser.providerDetails?.businessRegistrationNumber || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '10px 0 0 0', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                        Verification Credentials
                                    </h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Experience</label>
                                            <div className="form-input" style={{ background: 'var(--bg-tertiary)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                                {selectedUser.providerDetails?.experience || 'Not specified'}
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Aadhaar Number</label>
                                            <div className="form-input" style={{ background: 'var(--bg-tertiary)', letterSpacing: '1px', fontWeight: 600, minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                                {selectedUser.providerDetails?.aadhaarNumber || 'Not provided'}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedUser.providerDetails?.aadhaarCardImage && (
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Aadhaar Card Document</label>
                                            <div style={{ 
                                                border: '1px solid var(--border-color)', 
                                                borderRadius: '12px', 
                                                padding: '8px', 
                                                background: 'var(--bg-tertiary)',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <img 
                                                    src={selectedUser.providerDetails.aadhaarCardImage} 
                                                    alt="Aadhaar Card" 
                                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Services Offered</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {selectedUser.providerDetails?.services && selectedUser.providerDetails.services.length > 0 ? (
                                                selectedUser.providerDetails.services.map((service, index) => (
                                                    <span key={index} style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid var(--border-color)',
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        {typeof service === 'object' ? service.name : service}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>None selected</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                            {selectedUser.role === 'provider' && (
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleToggleApproval(selectedUser._id, selectedUser.providerDetails?.isApproved)}
                                    className={`status-action-btn ${selectedUser.providerDetails?.isApproved ? 'deactivate' : 'active'}`}
                                    style={{ marginRight: 'auto', padding: '10px 18px', borderRadius: '10px' }}
                                >
                                    {selectedUser.providerDetails?.isApproved ? 'Revoke Approval' : 'Approve Provider'}
                                </button>
                            )}
                            
                            <button
                                disabled={actionLoading}
                                onClick={() => handleToggleStatus(selectedUser._id, selectedUser.isActive)}
                                className={`status-action-btn ${selectedUser.isActive ? 'deactivate' : 'active'}`}
                                style={{ padding: '10px 18px', borderRadius: '10px' }}
                            >
                                {selectedUser.isActive ? 'Suspend' : 'Activate'}
                            </button>

                            <button type="button" className="btn-secondary" style={{ padding: '10px 18px', borderRadius: '10px' }} onClick={() => setSelectedUser(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
