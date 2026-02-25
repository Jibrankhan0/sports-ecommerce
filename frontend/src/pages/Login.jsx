import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [show, setShow] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(form.email, form.password);
        if (res.success) navigate(res.user.role === 'admin' ? '/admin' : '/account');
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">⚡ SPORT<span style={{ color: 'var(--accent)' }}>STORE</span></div>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-sub">Login to your account</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Password</label>
                        <input className="form-control" type={show ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                        <button type="button" onClick={() => setShow(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '2.2rem', background: 'none', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {show ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', padding: '0.85rem' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login →'}
                    </button>
                </form>
                <div className="auth-divider"><span>OR</span></div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link></p>
                </div>
                <div className="auth-demo">
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Demo Accounts:</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setForm({ email: 'admin@sportstore.com', password: 'admin123' })}>Admin Login</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setForm({ email: 'john@example.com', password: 'user123' })}>User Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
