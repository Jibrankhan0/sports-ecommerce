import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user || user.role !== 'admin') {
        navigate('/login');
        return null;
    }

    return (
        <div className={`admin-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Overlay for mobile */}
            {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span>⚡ Admin Panel</span>
                    <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>×</button>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">📊</span>
                        <span className="nav-label">Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">📦</span>
                        <span className="nav-label">Products</span>
                    </NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">📁</span>
                        <span className="nav-label">Categories</span>
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">🛍️</span>
                        <span className="nav-label">Orders</span>
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                        <span className="nav-icon">👥</span>
                        <span className="nav-label">Users</span>
                    </NavLink>
                </nav>
                <div className="admin-sidebar-footer">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back Site</button>
                    <button className="btn btn-ghost btn-danger btn-sm" onClick={logout}>Logout</button>
                </div>
            </aside>
            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <button className="admin-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                        <h2>Admin Dashboard</h2>
                    </div>
                    <div className="admin-user">
                        <span className="admin-user-welcome">Welcome, <strong>{user.name}</strong></span>
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
