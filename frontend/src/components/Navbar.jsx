import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';
import './Navbar.css';

const CATEGORIES = [
    { name: 'Cricket', slug: 'cricket', icon: '🏏' },
    { name: 'Football', slug: 'football', icon: '⚽' },
    { name: 'Badminton', slug: 'badminton', icon: '🏸' },
    { name: 'Tennis', slug: 'tennis', icon: '🎾' },
    { name: 'Gym Equipment', slug: 'gym-equipment', icon: '🏋️' },
    { name: 'Running Shoes', slug: 'running-shoes', icon: '👟' },
    { name: 'Sports Accessories', slug: 'sports-accessories', icon: '🎽' },
];

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [megaOpen, setMegaOpen] = useState(false);
    const [userDropOpen, setUserDropOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const searchRef = useRef(null);
    const searchTimer = useRef(null);
    const megaTimer = useRef(null);

    const openMega = () => {
        clearTimeout(megaTimer.current);
        setMegaOpen(true);
    };

    const closeMega = () => {
        megaTimer.current = setTimeout(() => setMegaOpen(false), 200);
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        clearTimeout(searchTimer.current);
        if (q.length < 2) { setSearchResults([]); setSearchOpen(false); return; }
        searchTimer.current = setTimeout(async () => {
            try {
                const { data } = await API.get(`/products/search?q=${q}`);
                setSearchResults(data);
                setSearchOpen(true);
            } catch { }
        }, 300);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">⚡</span>
                    <span className="logo-text">SPORT<span className="logo-accent">STORE</span></span>
                </Link>

                {/* Nav Links */}
                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
                    <div className="nav-dropdown" onMouseEnter={openMega} onMouseLeave={closeMega}>
                        <span className="nav-link">Categories ▾</span>
                        {megaOpen && (
                            <div className="mega-menu" onMouseEnter={openMega} onMouseLeave={closeMega}>
                                <div className="mega-menu-inner container">
                                    <div className="mega-grid">
                                        {CATEGORIES.map(cat => (
                                            <Link key={cat.slug} to={`/products?category=${cat.slug}`} className="mega-item" onClick={() => { setMegaOpen(false); setMenuOpen(false); }}>
                                                <span className="mega-icon">{cat.icon}</span>
                                                <span>{cat.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Link to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>Shop</Link>
                    {isAdmin && <Link to="/admin" className="nav-link nav-admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
                </div>

                {/* Search */}
                <div className="navbar-search" ref={searchRef}>
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => searchResults.length && setSearchOpen(true)}
                        />
                        <button type="submit" className="search-btn">🔍</button>
                    </form>
                    {searchOpen && searchResults.length > 0 && (
                        <div className="search-dropdown">
                            {searchResults.map(p => (
                                <Link key={p.id} to={`/product/${p.id}`} className="search-result" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                                    <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.name} />
                                    <div>
                                        <div className="search-result-name">{p.name}</div>
                                        <div className="search-result-price">Rs. {Number(p.price).toLocaleString()}</div>
                                    </div>
                                </Link>
                            ))}
                            <button className="search-view-all" onClick={() => { navigate(`/products?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); }}>
                                View all results →
                            </button>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="navbar-actions">
                    <button className="nav-icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button className="nav-icon-btn search-mobile-btn" onClick={() => navigate('/products')}>
                        🔍
                    </button>
                    <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
                        ♡<span className="icon-badge">{wishlist.length || ''}</span>
                    </Link>
                    <Link to="/cart" className="nav-icon-btn cart-btn" title="Cart">
                        🛒<span className="icon-badge">{cartCount || ''}</span>
                    </Link>
                    {user ? (
                        <div className="user-menu" onClick={() => setUserDropOpen(p => !p)}>
                            <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                            {userDropOpen && (
                                <div className="user-dropdown">
                                    <div className="user-dropdown-name">{user.name}</div>
                                    <Link to="/account" onClick={() => setUserDropOpen(false)}>My Account</Link>
                                    <Link to="/orders" onClick={() => setUserDropOpen(false)}>My Orders</Link>
                                    <Link to="/wishlist" onClick={() => setUserDropOpen(false)}>Wishlist</Link>
                                    {isAdmin && <Link to="/admin" onClick={() => setUserDropOpen(false)}>Admin Panel</Link>}
                                    <button onClick={() => { logout(); setUserDropOpen(false); }}>Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                    )}
                    <button className="hamburger" onClick={() => setMenuOpen(p => !p)}>☰</button>
                </div>
            </div>
        </nav>
    );
}
