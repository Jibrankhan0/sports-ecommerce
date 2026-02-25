import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-top container">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <span className="logo-icon">⚡</span>
                        <span>SPORT<span style={{ color: 'var(--accent)' }}>STORE</span></span>
                    </Link>
                    <p>Your premium destination for professional sports equipment, footwear, and accessories.</p>
                    <div className="social-links">
                        <a href="#" className="social-btn" title="Facebook">f</a>
                        <a href="#" className="social-btn" title="Instagram">ig</a>
                        <a href="#" className="social-btn" title="Twitter">𝕏</a>
                        <a href="#" className="social-btn" title="YouTube">▶</a>
                    </div>
                </div>
                <div className="footer-col">
                    <h4>Categories</h4>
                    <ul>
                        {['Cricket', 'Football', 'Badminton', 'Tennis', 'Gym Equipment', 'Running Shoes'].map(cat => (
                            <li key={cat}><Link to={`/products?category=${cat.toLowerCase().replace(/ /g, '-')}`}>{cat}</Link></li>
                        ))}
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Customer Service</h4>
                    <ul>
                        <li><Link to="/account">My Account</Link></li>
                        <li><Link to="/orders">Track Order</Link></li>
                        <li><Link to="/wishlist">Wishlist</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Newsletter</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Get the latest deals and sports news.</p>
                    <form className="newsletter-form" onSubmit={e => { e.preventDefault(); }}>
                        <input type="email" placeholder="Your email address" className="form-control" style={{ marginBottom: '0.75rem' }} />
                        <button type="submit" className="btn btn-primary w-full">Subscribe</button>
                    </form>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p>© 2026 SportStore. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}>Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
