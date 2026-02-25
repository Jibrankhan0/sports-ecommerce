import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';
import ImageZoom from '../components/ImageZoom';
import './ProductDetail.css';

const BASE = 'http://localhost:5000';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [specsOpen, setSpecsOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        setActiveImg(0);
        Promise.all([
            API.get(`/products/${id}`),
            API.get(`/products/${id}/related`)
        ]).then(([pRes, rRes]) => {
            setProduct(pRes.data.product);
            setReviews(pRes.data.reviews);
            setRelated(rRes.data);
        }).catch(() => navigate('/products'))
            .finally(() => setLoading(false));
        // Track recently viewed
        try {
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const filtered = viewed.filter(v => v !== parseInt(id));
            localStorage.setItem('recentlyViewed', JSON.stringify([parseInt(id), ...filtered].slice(0, 10)));
        } catch { }
    }, [id]);

    const handleAddToCart = async () => {
        setAdding(true);
        await addToCart(product.id, qty);
        setAdding(false);
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Login to submit a review'); return; }
        setSubmittingReview(true);
        try {
            await API.post(`/reviews/${id}`, reviewForm);
            const { data } = await API.get(`/products/${id}`);
            setReviews(data.reviews);
            setProduct(data.product);
            setReviewForm({ rating: 5, comment: '' });
            toast.success('Review submitted!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSubmittingReview(false); }
    };

    if (loading) return <div className="loader-wrap" style={{ minHeight: '80vh', paddingTop: '90px' }}><div className="loader" /></div>;
    if (!product) return null;

    const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'];
    const getImg = (src) => src.startsWith('http') ? src : BASE + src;
    const effectivePrice = product.discount_price || product.price;
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const inWl = isInWishlist(product.id);

    return (
        <div style={{ paddingTop: '90px' }}>
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link> / <Link to="/products">Shop</Link> /
                    <Link to={`/products?category=${product.category_slug}`}>{product.category_name}</Link> /
                    <span>{product.name}</span>
                </div>

                {/* Product Main */}
                <div className="pd-grid">
                    {/* Gallery */}
                    <div className="pd-gallery">
                        <div className="pd-main-img" style={{ border: 'none' }}>
                            <ImageZoom src={getImg(images[activeImg])} alt={product.name} />
                            {hasDiscount && (
                                <div className="pd-discount-tag">
                                    {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="pd-thumbs">
                                {images.map((img, i) => (
                                    <button key={i} className={`pd-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                                        <img src={getImg(img)} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="pd-info">
                        <div className="pd-category">{product.category_name}</div>
                        <h1 className="pd-title">{product.name}</h1>
                        <div className="pd-brand">By <span style={{ color: 'var(--accent)' }}>{product.brand}</span></div>

                        <div className="pd-rating-row">
                            <StarRating rating={product.rating} size={16} />
                            <span>{Number(product.rating).toFixed(1)}</span>
                            <span style={{ color: 'var(--text-dim)' }}>({product.review_count} reviews)</span>
                            <span style={{ color: 'var(--text-dim)' }}>• {product.sold_count} sold</span>
                        </div>

                        <div className="pd-price-block">
                            <span className="pd-price">Rs. {Number(effectivePrice).toLocaleString()}</span>
                            {hasDiscount && <span className="price-original" style={{ fontSize: '1.2rem' }}>Rs. {Number(product.price).toLocaleString()}</span>}
                        </div>

                        <div className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                            {product.stock > 0 ? `✓ In Stock (${product.stock} units)` : '✗ Out of Stock'}
                        </div>

                        <p className="pd-desc">{product.description}</p>

                        {/* Specs accordion */}
                        {product.specifications && (
                            <div className="pd-specs">
                                <button className="pd-specs-toggle" onClick={() => setSpecsOpen(p => !p)}>
                                    📋 Specifications {specsOpen ? '▲' : '▼'}
                                </button>
                                {specsOpen && (
                                    <div className="pd-specs-body">
                                        {product.specifications.split('|').map((spec, i) => {
                                            const [key, val] = spec.trim().split(':');
                                            return (
                                                <div key={i} className="pd-spec-row">
                                                    <span className="pd-spec-key">{key?.trim()}</span>
                                                    <span className="pd-spec-val">{val?.trim()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quantity + Add to Cart */}
                        <div className="pd-actions">
                            <div className="qty-control">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                            </div>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToCart} disabled={adding || product.stock === 0}>
                                {adding ? 'Adding...' : '🛒 Add to Cart'}
                            </button>
                            <button className={`wishlist-toggle-btn ${inWl ? 'active' : ''}`} onClick={() => inWl ? removeFromWishlist(product.id) : addToWishlist(product.id)}>
                                {inWl ? '♥' : '♡'}
                            </button>
                        </div>
                        <button className="btn btn-outline w-full" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/cart')}>
                            View Cart
                        </button>
                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <section style={{ marginTop: '4rem' }}>
                        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Related Products</h2>
                        <div className="product-grid">
                            {related.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </section>
                )}

                {/* Reviews */}
                <section style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                    <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Customer Reviews</h2>
                    <div className="reviews-layout">
                        {/* Review List */}
                        <div className="review-list">
                            {reviews.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>}
                            {reviews.map(r => (
                                <div key={r.id} className="review-item card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="reviewer-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)', color: 'var(--bg-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {r.user_name[0]}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{r.user_name}</span>
                                        </div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <StarRating rating={r.rating} size={13} />
                                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{r.comment}</p>
                                </div>
                            ))}
                        </div>
                        {/* Review Form */}
                        <div className="review-form card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontFamily: 'Rajdhani', marginBottom: '1.25rem' }}>Write a Review</h3>
                            {!user && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}><Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link> to submit a review.</p>}
                            <form onSubmit={handleReview} style={{ opacity: user ? 1 : 0.5, pointerEvents: user ? 'all' : 'none' }}>
                                <div className="form-group">
                                    <label className="form-label">Your Rating</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="button" key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                                            style={{ fontSize: '1.5rem', color: s <= reviewForm.rating ? 'var(--warning)' : 'var(--text-dim)', background: 'none', cursor: 'pointer' }}>★</button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Your Review</label>
                                    <textarea className="form-control" rows={4} placeholder="Share your experience with this product..." value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} required />
                                </div>
                                <button type="submit" className="btn btn-primary w-full" disabled={submittingReview}>
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
