import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function Account() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.put('/auth/profile', form);
            updateUser(form);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="container">
                <h1 style={{ fontFamily: 'Rajdhani', marginBottom: '2rem' }}>My Account</h1>
                <div className="card" style={{ maxWidth: '600px', padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Profile Information</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-control" value={form.email} disabled style={{ opacity: 0.6 }} />
                            <small style={{ color: 'var(--text-dim)' }}>Email cannot be changed</small>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Shipping Address</label>
                            <textarea className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3} />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
