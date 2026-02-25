import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(form.name, form.email, form.password, form.phone);
        if (res.success) navigate('/account');
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">⚡ SPORT<span style={{ color: 'var(--accent)' }}>STORE</span></div>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-sub">Join the premium sports community</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-control" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input className="form-control" type="text" placeholder="+92 3XX XXXXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', padding: '0.85rem' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register →'}
                    </button>
                </form>
                <div className="auth-divider"><span>OR</span></div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link></p>
                </div>
            </div>
        </div>
    );
}
