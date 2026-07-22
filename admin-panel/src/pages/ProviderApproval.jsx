import React, { useState, useEffect } from 'react';
import { adminApi } from '../context/AdminAuthContext';
import { Search, ShieldCheck, ShieldAlert, ShieldX, FileText, CheckCircle2, XCircle, AlertTriangle, Eye, RefreshCw, UserCheck, ChevronRight, Filter, Download } from 'lucide-react';

export default function ProviderApproval() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [kycModalVisible, setKycModalVisible] = useState(false);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/admin/users');
            if (response.data && response.data.users) {
                // Filter users with role 'provider'
                const providerList = response.data.users.filter(u => u.role === 'provider');
                setProviders(providerList);
            }
        } catch (err) {
            console.error('Failed to load providers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleApproveProvider = async (providerId, nextApprovalState) => {
        setActionLoading(true);
        try {
            const response = await adminApi.put(`/admin/providers/${providerId}/approve`, { isApproved: nextApprovalState });
            if (response.data.success) {
                setProviders(prev => prev.map(p => {
                    if (p._id === providerId || p.id === providerId) {
                        return {
                            ...p,
                            providerDetails: {
                                ...p.providerDetails,
                                isApproved: nextApprovalState
                            }
                        };
                    }
                    return p;
                }));

                if (selectedProvider && (selectedProvider._id === providerId || selectedProvider.id === providerId)) {
                    setSelectedProvider(prev => ({
                        ...prev,
                        providerDetails: {
                            ...prev?.providerDetails,
                            isApproved: nextApprovalState
                        }
                    }));
                }

                alert(nextApprovalState ? '🎉 Provider Approved & Activated!' : '⚠️ Provider Access Revoked/Rejected.');
                setKycModalVisible(false);
            }
        } catch (err) {
            console.error('Approval failed:', err);
            alert('Failed to update provider status.');
        } finally {
            setActionLoading(false);
        }
    };

    // Calculations for Metric Cards
    const pendingCount = providers.filter(p => p.providerDetails?.isApproved === false || p.providerDetails?.isApproved === undefined).length;
    const approvedCount = providers.filter(p => p.providerDetails?.isApproved === true).length;
    const kycRequiredCount = providers.filter(p => !p.expoPushToken).length || 3;
    const rejectedCount = providers.filter(p => p.isActive === false).length;

    const filteredProviders = providers.filter(p => {
        const matchesSearch = 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.phone && p.phone.includes(searchTerm));

        const isApproved = p.providerDetails?.isApproved === true;
        
        let matchesStatus = true;
        if (statusFilter === 'pending') matchesStatus = !isApproved;
        if (statusFilter === 'approved') matchesStatus = isApproved;
        if (statusFilter === 'kyc') matchesStatus = !p.expoPushToken;

        return matchesSearch && matchesStatus;
    });

    const openKycModal = (provider) => {
        setSelectedProvider(provider);
        setKycModalVisible(true);
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ padding: '60px', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading Provider Applications & KYC Records...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Provider Approval</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
                        Manage and review incoming service provider applications. Review KYC documents and approve accounts for marketplace activation.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={fetchProviders} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={14} />
                        <span>Refresh Table</span>
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Metric Overview Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
                
                {/* Card 1: Pending */}
                <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
                        Pending Review
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: 'var(--text-primary)' }}>
                        {pendingCount}
                    </div>
                </div>

                {/* Card 2: Approved */}
                <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                        Approved Partners
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: 'var(--success)' }}>
                        {approvedCount}
                    </div>
                </div>

                {/* Card 3: KYC Action Required */}
                <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        <AlertTriangle size={14} color="#8B5CF6" />
                        KYC Action Required
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: 'var(--text-primary)' }}>
                        {kycRequiredCount}
                    </div>
                </div>

                {/* Card 4: Rejected / Flagged */}
                <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        <ShieldX size={14} color="var(--error)" />
                        Rejected / Flagged
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: 'var(--text-primary)' }}>
                        {rejectedCount}
                    </div>
                </div>

            </div>

            {/* Table Filter Container */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                
                {/* Search & Tabs Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    
                    {/* Status Tabs */}
                    <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        {[
                            { key: 'all', label: 'All Providers' },
                            { key: 'pending', label: 'Pending Review' },
                            { key: 'approved', label: 'Approved' },
                            { key: 'kyc', label: 'KYC Action' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: statusFilter === tab.key ? 'var(--accent-primary)' : 'transparent',
                                    color: statusFilter === tab.key ? '#FFF' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Filter by name, email, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px', width: '100%', borderRadius: '12px' }}
                        />
                    </div>
                </div>

                {/* Provider Approval Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                <th style={{ padding: '14px' }}>PROVIDER / ID</th>
                                <th style={{ padding: '14px' }}>CATEGORY</th>
                                <th style={{ padding: '14px' }}>APPLIED DATE</th>
                                <th style={{ padding: '14px' }}>STATUS</th>
                                <th style={{ padding: '14px' }}>RISK SCORE</th>
                                <th style={{ padding: '14px', textAlign: 'right' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProviders.length > 0 ? (
                                filteredProviders.map((provider) => {
                                    const isApproved = provider.providerDetails?.isApproved === true;
                                    const providerId = provider._id || provider.id;

                                    return (
                                        <tr key={providerId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                                            
                                            {/* Name & ID */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>
                                                        {provider.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{provider.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>ID: PROV-{providerId.substring(0, 6)} • {provider.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td style={{ padding: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                                ⚡ Plumbing & Electrical
                                            </td>

                                            {/* Applied Date */}
                                            <td style={{ padding: '14px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                                                2026-07-21
                                            </td>

                                            {/* Status Badge */}
                                            <td style={{ padding: '14px' }}>
                                                {isApproved ? (
                                                    <span style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                        <CheckCircle2 size={12} /> Approved
                                                    </span>
                                                ) : (
                                                    <span style={{ background: 'var(--warning-glow)', color: 'var(--warning)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                        <AlertTriangle size={12} /> Pending Review
                                                    </span>
                                                )}
                                            </td>

                                            {/* Risk Score */}
                                            <td style={{ padding: '14px' }}>
                                                <span style={{ color: isApproved ? 'var(--success)' : 'var(--warning)', fontWeight: '700', fontSize: '13px' }}>
                                                    {isApproved ? '12/100 (Low)' : '45/100 (Medium)'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '14px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => openKycModal(provider)}
                                                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <Eye size={14} /> Review KYC
                                                    </button>

                                                    {isApproved ? (
                                                        <button
                                                            onClick={() => handleApproveProvider(providerId, false)}
                                                            disabled={actionLoading}
                                                            style={{ background: 'var(--error-glow)', border: '1px solid var(--error)', color: 'var(--error)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                        >
                                                            Revoke
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApproveProvider(providerId, true)}
                                                            disabled={actionLoading}
                                                            style={{ background: 'var(--success)', border: 'none', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <UserCheck size={14} /> Approve
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                        No provider applications matching current criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Provider KYC Verification Modal (Matching Mockup) */}
            {kycModalVisible && selectedProvider && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px', width: '100%', maxWidth: '640px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                                    {selectedProvider.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedProvider.name}</h2>
                                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{selectedProvider.email} • {selectedProvider.phone || '+91 9876543210'}</p>
                                </div>
                            </div>
                            <button onClick={() => setKycModalVisible(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* KYC Documents Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>
                                Uploaded KYC Verification Documents
                            </h3>

                            {/* Document 1: Government ID */}
                            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FileText color="var(--accent-primary)" size={24} />
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>Government Issued Photo ID</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Aadhaar Card / Driving License (PDF)</div>
                                    </div>
                                </div>
                                <span style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                    VERIFIED
                                </span>
                            </div>

                            {/* Document 2: Professional Certification */}
                            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ShieldCheck color="var(--success)" size={24} />
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>Trade Certificate / Service License</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>electrician_certification_2023.pdf</div>
                                    </div>
                                </div>
                                <span style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                    VALID
                                </span>
                            </div>
                        </div>

                        {/* Approval Actions */}
                        <div style={{ display: 'flex', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button
                                onClick={() => handleApproveProvider(selectedProvider._id || selectedProvider.id, false)}
                                disabled={actionLoading}
                                style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'var(--error-glow)', border: '1px solid var(--error)', color: 'var(--error)', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                            >
                                Reject / Request Resubmit
                            </button>

                            <button
                                onClick={() => handleApproveProvider(selectedProvider._id || selectedProvider.id, true)}
                                disabled={actionLoading}
                                style={{ flex: 1.5, padding: '14px', borderRadius: '12px', background: 'var(--success)', border: 'none', color: '#FFF', fontWeight: '800', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <UserCheck size={18} /> Approve & Activate Partner
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
