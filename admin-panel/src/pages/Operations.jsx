import React from 'react';
import { Download, Globe, TrendingUp, Users, Calendar } from 'lucide-react';

export default function Operations() {
    return (
        <div style={{ padding: '24px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Analytics & Performance</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
                        Operations overview and global service metrics across all service zones.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} />
                        <span>Last 30 Days</span>
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={14} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
                        <span>Total Bookings</span>
                        <Calendar size={18} color="var(--accent-primary)" />
                    </div>
                    <div style={{ fontSize: '38px', fontWeight: '800', marginTop: '14px', color: 'var(--text-primary)' }}>12,450</div>
                    <div style={{ color: 'var(--success)', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>+14.2% vs last month</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
                        <span>Active Providers</span>
                        <Users size={18} color="#8B5CF6" />
                    </div>
                    <div style={{ fontSize: '38px', fontWeight: '800', marginTop: '14px', color: 'var(--text-primary)' }}>3,205</div>
                    <div style={{ color: 'var(--success)', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>+6.8% vs last month</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
                        <span>Customer Retention Rate</span>
                        <TrendingUp size={18} color="var(--success)" />
                    </div>
                    <div style={{ fontSize: '38px', fontWeight: '800', marginTop: '14px', color: 'var(--text-primary)' }}>84.2%</div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginTop: '14px', overflow: 'hidden' }}>
                        <div style={{ width: '84.2%', height: '100%', background: 'var(--success)' }} />
                    </div>
                </div>

            </div>

            {/* Global Coverage Map & Density Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
                
                {/* Global Coverage Visualizer */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>ACTIVE SERVICE ZONES</span>
                            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Global Coverage Map</h3>
                        </div>
                        <span style={{ background: 'var(--warning-glow)', color: 'var(--warning)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>● High Demand</span>
                    </div>

                    <div style={{ height: '240px', background: 'radial-gradient(ellipse at center, rgba(15, 82, 186, 0.15) 0%, rgba(11, 8, 19, 0.9) 100%)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <Globe size={120} color="rgba(99, 102, 241, 0.2)" />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-primary)' }}>50+ Active Cities Connected</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Live Dispatch Latency: ~240ms</div>
                        </div>
                    </div>
                </div>

                {/* Provider Density breakdown */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Provider Density</h3>

                    <div style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Urban Centers</span>
                            <span style={{ color: 'var(--text-primary)' }}>75%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '75%', height: '100%', background: 'var(--accent-primary)' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Suburban Zones</span>
                            <span style={{ color: 'var(--text-primary)' }}>45%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '45%', height: '100%', background: '#8B5CF6' }} />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Rural Outskirts</span>
                            <span style={{ color: 'var(--text-primary)' }}>15%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '15%', height: '100%', background: 'var(--warning)' }} />
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', padding: '12px', borderRadius: '10px', background: 'var(--success-glow)', border: '1px solid var(--success)', textAlign: 'center', color: 'var(--success)', fontSize: '12px', fontWeight: '700' }}>
                        ✓ Density vs Demand: Optimized
                    </div>
                </div>

            </div>

        </div>
    );
}
