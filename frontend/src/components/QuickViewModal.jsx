import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { IMG_BASE } from '../services/api';
import StarRating from './StarRating';

// Image base URL is now dynamic

export default function QuickViewModal({ product, onClose }) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);

    if (!product) return null;
    const img = product.images?.[0]
        ? (product.images[0].startsWith('http') ? product.images[0] : IMG_BASE + product.images[0])
        : 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600';

    const effectivePrice = product.discount_price || product.price;
    const inWl = isInWishlist(product._id);

    const handleAdd = async () => {
        setAdding(true);
        await addToCart(product._id, qty);
        setAdding(false);
        onClose();
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKey); };
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0', overflow: 'hidden', maxWidth: '780px', width: '90%' }}>
                <div style={{ flex: '1', background: 'var(--bg-card2)' }}>
                    <img src={img} alt={product.name} style={{ width: '100%', height: '360px', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: '1.2', padding: '2rem', overflowY: 'auto' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', fontSize: '1.4rem', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{product.category?.name || product.category_name}</div>
                    <h2 style={{ fontFamily: 'Rajdhani', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{product.name}</h2>
                    <div style={{ marginBottom: '0.75rem' }}><StarRating rating={product.rating} size={14} /></div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontFamily: 'Rajdhani', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>Rs. {Number(effectivePrice).toLocaleString()}</span>
                        {product.discount_price && <span style={{ color: 'var(--text-dim)', textDecoration: 'line-through', fontSize: '1rem' }}>Rs. {Number(product.price).toLocaleString()}</span>}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>{product.description?.slice(0, 200)}...</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '0.4rem 0.75rem', background: 'none', color: 'var(--text)', fontSize: '1rem', cursor: 'pointer' }}>−</button>
                            <span style={{ padding: '0.4rem 1rem', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>{qty}</span>
                            <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ padding: '0.4rem 0.75rem', background: 'none', color: 'var(--text)', fontSize: '1rem', cursor: 'pointer' }}>+</button>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd} disabled={adding || product.stock === 0}>
                            {adding ? 'Adding...' : '🛒 Add to Cart'}
                        </button>
                        <button onClick={() => inWl ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                            style={{ padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'none', color: inWl ? '#ff5252' : 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', transition: 'var(--transition)' }}>
                            {inWl ? '♥' : '♡'}
                        </button>
                    </div>
                    <Link to={`/product/${product._id}`} onClick={onClose} style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--accent)' }}>
                        View full details →
                    </Link>
                </div>
            </div>
        </div>
    );
}
