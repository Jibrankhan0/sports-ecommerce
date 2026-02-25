import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await API.get('/admin/users');
        setUsers(res.data);
        setLoading(false);
    };

    const handleRoleUpdate = async (id, role) => {
        try {
            await API.put(`/admin/users/${id}/role`, { role });
            toast.success('User role updated');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-users">
            <div style={{ marginBottom: '2rem' }}>
                <h3>User Management</h3>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {u.avatar ? <img src={u.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} /> : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#000', fontWeight: 'bold' }}>{u.name[0]}</div>}
                                    {u.name}
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`badge badge-${u.role === 'admin' ? 'danger' : 'success'}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    {u.role === 'user' ? (
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleRoleUpdate(u.id, 'admin')}>Make Admin</button>
                                    ) : (
                                        <button className="btn btn-ghost btn-danger btn-sm" onClick={() => handleRoleUpdate(u.id, 'user')}>Remove Admin</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
