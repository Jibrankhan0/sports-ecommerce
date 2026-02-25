import { useState, useEffect } from 'react';
import API from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/admin/stats').then(res => {
            setStats(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="loader-wrap"><div className="loader" /></div>;

    return (
        <div className="admin-dashboard">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>Rs. {Number(stats.revenue).toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Orders</div>
                    <div className="stat-value">{stats.orders}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Users</div>
                    <div className="stat-value">{stats.users}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Products</div>
                    <div className="stat-value">{stats.products}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Rajdhani' }}>Monthly Revenue</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="month" stroke="var(--text-dim)" />
                                <YAxis stroke="var(--text-dim)" />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                                <Area type="monotone" dataKey="total" stroke="var(--accent)" fill="rgba(0, 212, 255, 0.1)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Rajdhani' }}>Top Selling Products</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topProducts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="var(--text-dim)" />
                                <YAxis stroke="var(--text-dim)" />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                                <Bar dataKey="sold" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Rajdhani' }}>Low Stock Alert</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Current Stock</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.lowStockProducts?.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.category_name}</td>
                                    <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{p.stock}</td>
                                    <td><button className="btn btn-ghost btn-sm">Restock</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
