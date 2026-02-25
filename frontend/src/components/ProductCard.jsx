import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from './StarRating';
import './ProductCard.css';

const BASE = 'http://localhost:5000';

export default function ProductCard({ product, onQuickView }) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);

    const img = product.images?.[0]
        ? (product.images[0].startsWith('http') ? product.images[0] : BASE + product.images[0])
        : 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400';

    const effectivePrice = product.discount_price || product.price;
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const discountPct = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const inWl = isInWishlist(product.id);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAdding(true);
        await addToCart(product.id, 1);
        setAdding(false);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        inWl ? removeFromWishlist(product.id) : addToWishlist(product.id);
    };

    return (
        <div className="product-card animate-fade">
            <Link to={`/product/${product.id}`} className="card-image-wrap">
                <img src={img} alt={product.name} className="card-img" loading="lazy" />
                {hasDiscount && <span className="card-discount-badge">{discountPct}% OFF</span>}
                {product.stock === 0 && <div className="card-out-of-stock">Out of Stock</div>}
                <div className="card-overlay">
                    <button className="card-quick-view" onClick={e => { e.preventDefault(); onQuickView && onQuickView(product); }}>
                        👁 Quick View
                    </button>
                </div>
            </Link>
            <div className="card-body">
                <div className="card-category">{product.category_name}</div>
                <Link to={`/product/${product.id}`} className="card-title">{product.name}</Link>
                <div className="card-brand">{product.brand}</div>
                <div className="card-rating">
                    <StarRating rating={product.rating} size={12} />
                    <span className="card-rating-count">({product.review_count || 0})</span>
                </div>
                <div className="card-footer">
                    <div className="card-prices">
                        <span className="price">Rs. {Number(effectivePrice).toLocaleString()}</span>
                        {hasDiscount && <span className="price-original">Rs. {Number(product.price).toLocaleString()}</span>}
                    </div>
                    <div className="card-actions">
                        <button className={`wishlist-btn ${inWl ? 'active' : ''}`} onClick={handleWishlist} title="Wishlist">
                            {inWl ? '♥' : '♡'}
                        </button>
                        <button className="add-cart-btn" onClick={handleAddToCart} disabled={adding || product.stock === 0}>
                            {adding ? '...' : '🛒'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
