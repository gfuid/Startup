import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Dashboard from './pages/Dashboard';
import ProviderApproval from './pages/ProviderApproval';
import Operations from './pages/Operations';
import Finance from './pages/Finance';
import Users from './pages/Users';
import Bookings from './pages/Bookings';
import Services from './pages/Services';
import { LayoutDashboard, ShieldCheck, Activity, DollarSign, Users as UsersIcon, Calendar, Briefcase, LogOut, Lock, Shield } from 'lucide-react';

function AdminAppContent() {
    const { admin, loading, login, logout } = useAdminAuth();
    const [activeTab, setActiveTab] = useState('providers');
    
    // Login form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError(null);
        try {
            await login(email, password);
        } catch (err) {
            setLoginError(err.message || 'Login failed');
        } finally {
            setLoginLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Initialising Enterprise Administration Console...</p>
            </div>
        );
    }

    // Login portal if unauthenticated
    if (!admin) {
        return (
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-logo">
                        <div className="logo-icon">SH</div>
                    </div>
                    <h1 className="login-title">ServiceHub Enterprise</h1>
                    <p className="login-subtitle">Secure access portal for provider approval & system administration</p>
                    
                    {loginError && (
                        <div style={{ background: 'var(--error-glow)', color: 'var(--error)', padding: '12px', borderRadius: '12px', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="admin@servicehub.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '30px' }}>
                            <label className="form-label">Security Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loginLoading}>
                            <Lock size={16} />
                            <span>{loginLoading ? 'Authenticating...' : 'Sign In to Console'}</span>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Active Page Render Switch
    const renderActivePage = () => {
        switch (activeTab) {
            case 'providers': return <ProviderApproval />;
            case 'dashboard': return <Dashboard />;
            case 'operations': return <Operations />;
            case 'finance': return <Finance />;
            case 'users': return <Users />;
            case 'bookings': return <Bookings />;
            case 'services': return <Services />;
            default: return <ProviderApproval />;
        }
    };

    return (
        <div className="admin-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="logo-container">
                    <div className="logo-icon">SH</div>
                    <div>
                        <span className="logo-text">ServiceHub</span>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Enterprise Admin</div>
                    </div>
                </div>

                <ul className="menu-list">
                    <li 
                        className={`menu-item ${activeTab === 'providers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('providers')}
                    >
                        <ShieldCheck size={18} />
                        <span>Provider Approval</span>
                    </li>
                    <li 
                        className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </li>
                    <li 
                        className={`menu-item ${activeTab === 'operations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('operations')}
                    >
                        <Activity size={18} />
                        <span>Operations</span>
                    </li>
                    <li 
                        className={`menu-item ${activeTab === 'finance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('finance')}
                    >
                        <DollarSign size={18} />
                        <span>Finance</span>
                    </li>
                    <li 
                        className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <UsersIcon size={18} />
                        <span>User Management</span>
                    </li>
                    <li 
                        className={`menu-item ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        <Briefcase size={18} />
                        <span>Services</span>
                    </li>
                    <li 
                        className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <Calendar size={18} />
                        <span>Bookings</span>
                    </li>
                </ul>

                <button className="logout-btn" onClick={logout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <header className="top-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={16} color="var(--accent-primary)" />
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Admin Portal • Logged in as {admin.name}</span>
                    </div>
                </header>

                <section style={{ flex: 1 }}>
                    {renderActivePage()}
                </section>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <AdminAuthProvider>
            <AdminAppContent />
        </AdminAuthProvider>
    );
}
