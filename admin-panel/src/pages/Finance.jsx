import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export default function Finance() {
    return (
        <div style={{ padding: '24px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Financial Operations</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
                        Manage platform revenue, transaction ledgers, payouts, and dispute resolutions.
                    </p>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>GROSS VOLUME</div>
                    <div style={{ fontSize: '38px', fontWeight: '800', marginTop: '10px', color: 'var(--text-primary)' }}>₹1.24M</div>
                    <div style={{ color: 'var(--success)', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>+12.5% vs previous 30 days</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>NET REVENUE</div>
                    <div style={{ fontSize: '38px', fontWeight: '800', marginTop: '10px', color: 'var(--success)' }}>₹984.2K</div>
                    <div style={{ color: 'var(--success)', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>+8.2% vs previous 30 days</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>DISPUTE RATE</div>
                    <div style={{ fontSize: '38px', fontWeight: '800', marginTop: '10px', color: 'var(--warning)' }}>0.12%</div>
                    <div style={{ color: 'var(--warning)', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>+0.01% Requires attention</div>
                </div>

            </div>

            {/* Transactions & Disputes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                
                {/* Recent Transactions */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Recent Transactions</h3>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                <th style={{ padding: '12px' }}>AMOUNT / DATE</th>
                                <th style={{ padding: '12px' }}>CUSTOMER</th>
                                <th style={{ padding: '12px' }}>STATUS</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>METHOD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { amount: '₹1,450.00', date: 'Jul 21, 14:23', name: 'Acme Corp', status: 'Succeeded', method: '•••• 4242' },
                                { amount: '₹890.50', date: 'Jul 21, 11:05', name: 'Global Logistics', status: 'Processing', method: 'UPI Push' },
                                { amount: '₹3,200.00', date: 'Jul 20, 16:45', name: 'Vertex Inc', status: 'Succeeded', method: '•••• 1024' },
                            ].map((tx, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: '700' }}>{tx.amount}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{tx.date}</div>
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: '600' }}>{tx.name}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ background: tx.status === 'Succeeded' ? 'var(--success-glow)' : 'var(--warning-glow)', color: tx.status === 'Succeeded' ? 'var(--success)' : 'var(--warning)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '13px' }}>{tx.method}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Upcoming Payouts */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Upcoming Payouts</h3>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>NEXT PAYOUT • TOMORROW</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px', color: 'var(--accent-primary)' }}>₹42,500.00</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>To ending in ••8892</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-color)', fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Jul 26</span>
                        <span style={{ fontWeight: '700' }}>₹12,400.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-color)', fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Jul 28</span>
                        <span style={{ fontWeight: '700' }}>₹8,150.00</span>
                    </div>
                </div>

            </div>

        </div>
    );
}
