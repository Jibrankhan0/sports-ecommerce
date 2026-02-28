import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { IMG_BASE } from '../services/api';
import StarRating from './StarRating';
import './QuickViewModal.css';

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
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-image-col">
                    <img src={img} alt={product.name} />
                </div>
                <div className="modal-info-col">
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                    <div className="modal-category">{product.category?.name || product.category_name}</div>
                    <h2 className="modal-title">{product.name}</h2>
                    <div style={{ marginBottom: '0.75rem' }}><StarRating rating={product.rating} size={14} /></div>
                    <div className="modal-price-wrap">
                        <span className="modal-price">Rs. {Number(effectivePrice).toLocaleString()}</span>
                        {product.discount_price && <span className="modal-old-price">Rs. {Number(product.price).toLocaleString()}</span>}
                    </div>
                    <p className="modal-description">{product.description?.slice(0, 200)}...</p>

                    <div className="modal-qty-wrap">
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty:</span>
                        <div className="qty-control">
                            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                            <span className="qty-val">{qty}</span>
                            <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                        </div>
                        <span className={`modal-stock ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                    </div>

                    <div className="modal-actions">
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd} disabled={adding || product.stock === 0}>
                            {adding ? 'Adding...' : '🛒 Add to Cart'}
                        </button>
                        <button onClick={() => inWl ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                            style={{ padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'none', color: inWl ? '#ff5252' : 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', transition: 'var(--transition)' }}>
                            {inWl ? '♥' : '♡'}
                        </button>
                    </div>

                    <Link to={`/product/${product._id}`} onClick={onClose} className="view-details-link" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 600 }}>
                        View full details →
                    </Link>
                </div>
            </div>
        </div>
    );
}
