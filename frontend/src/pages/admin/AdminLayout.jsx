import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user || user.role !== 'admin') {
        navigate('/login');
        return null;
    }

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-brand">⚡ Admin Panel</div>
                <nav className="admin-nav">
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>📊 Dashboard</NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''}>📦 Products</NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'active' : ''}>📁 Categories</NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>🛍️ Orders</NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>👥 Users</NavLink>
                </nav>
                <div className="admin-sidebar-footer">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back Site</button>
                    <button className="btn btn-ghost btn-danger btn-sm" onClick={logout}>Logout</button>
                </div>
            </aside>
            <main className="admin-main">
                <header className="admin-header">
                    <h2>Admin Dashboard</h2>
                    <div className="admin-user">
                        <span>Welcome, <strong>{user.name}</strong></span>
                        {user.avatar && <img src={user.avatar} alt="" className="admin-avatar" />}
                    </div>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
