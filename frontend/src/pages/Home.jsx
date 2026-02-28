import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import StarRating from '../components/StarRating';
import CategorySlider from '../components/CategorySlider';
import ReviewCard from '../components/ReviewCard';
import './Home.css';

const HERO_SLIDES = [
    { title: 'DOMINATE THE GAME', sub: 'Premium cricket gear for champions', cat: 'cricket', bg: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(123,47,247,0.15))', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=900' },
    { title: 'PLAY TO WIN', sub: 'The best football boots & gear', cat: 'football', bg: 'linear-gradient(135deg,rgba(0,230,118,0.12),rgba(0,212,255,0.12))', img: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900' },
    { title: 'ELEVATE YOUR GAME', sub: 'Next-gen gym equipment for serious athletes', cat: 'gym-equipment', bg: 'linear-gradient(135deg,rgba(255,215,64,0.12),rgba(123,47,247,0.12))', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900' },
];

const CATEGORIES = [
    { name: 'Cricket', slug: 'cricket', icon: '🏏', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300' },
    { name: 'Football', slug: 'football', icon: '⚽', img: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=300' },
    { name: 'Badminton', slug: 'badminton', icon: '🏸', img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300' },
    { name: 'Tennis', slug: 'tennis', icon: '🎾', img: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=300' },
    { name: 'Gym', slug: 'gym-equipment', icon: '🏋️', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
    { name: 'Running', slug: 'running-shoes', icon: '👟', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
    { name: 'Accessories', slug: 'sports-accessories', icon: '🎽', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300' },
];

const REVIEWS = [
    { name: 'Ahmed Ali', rating: 5, text: 'Absolutely amazing quality! The cricket bat exceeded my expectations. Fast delivery and great packaging.', date: 'Jan 2026' },
    { name: 'Fatima Khan', rating: 5, text: 'The Yonex racket I ordered is top-notch. Exactly as described. Will definitely shop here again!', date: 'Feb 2026' },
    { name: 'Rahul Sharma', rating: 4, text: 'Great selection of running shoes. The Adidas Ultraboost comfort is unreal. SportStore is my go-to!', date: 'Feb 2026' },
    { name: 'Sara Malik', rating: 5, text: 'Ordered gym equipment and the quality is outstanding. Customer service was very helpful too.', date: 'Jan 2026' },
];

export default function Home() {
    const navigate = useNavigate();
    const [slide, setSlide] = useState(0);
    const [featured, setFeatured] = useState({ featured: [], trending: [], newArrivals: [], bestSellers: [] });
    const [loading, setLoading] = useState(true);
    const [quickView, setQuickView] = useState(null);
    const [activeTab, setActiveTab] = useState('featured');
    const [email, setEmail] = useState('');

    useEffect(() => {
        API.get('/products/featured').then(r => { setFeatured(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
        return () => clearInterval(timer);
    }, []);

    const tabProducts = {
        featured: featured.featured,
        trending: featured.trending,
        newArrivals: featured.newArrivals,
        bestSellers: featured.bestSellers,
    };

    return (
        <div className="home">
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" style={{ background: HERO_SLIDES[slide].bg }}>
                    <img src={HERO_SLIDES[slide].img} alt="hero" className="hero-img" />
                    <div className="hero-overlay" />
                </div>
                <div className="hero-content container">
                    <div className="hero-text animate-fade" key={slide} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="hero-eyebrow">New Season 2026</div>
                        <h1 className="hero-title">{HERO_SLIDES[slide].title}</h1>
                        <p className="hero-sub">{HERO_SLIDES[slide].sub}</p>
                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={() => navigate(`/products?category=${HERO_SLIDES[slide].cat}`)}>
                                Shop Now →
                            </button>
                            <button className="btn btn-outline btn-lg" onClick={() => navigate('/products')}>
                                View All
                            </button>
                        </div>
                        <div className="hero-dots">
                            {HERO_SLIDES.map((_, i) => (
                                <button key={i} className={`hero-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="hero-stats container">
                    {[['10K+', 'Happy Customers'], ['500+', 'Products'], ['50+', 'Top Brands'], ['2-Day', 'Fast Delivery']].map(([n, l]) => (
                        <div key={l} className="hero-stat">
                            <div className="hero-stat-num">{n}</div>
                            <div className="hero-stat-label">{l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Category Slider */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Shop By Category</h2>
                        <p className="section-subtitle">Explore our complete range of sports categories</p>
                    </div>
                    <CategorySlider />
                </div>
            </section>

            {/* Products Tabs */}
            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Our Products</h2>
                    </div>
                    <div className="tab-bar">
                        {[['featured', '⭐ Featured'], ['trending', '🔥 Trending'], ['newArrivals', '🆕 New Arrivals'], ['bestSellers', '🏆 Best Sellers']].map(([key, label]) => (
                            <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
                                {label}
                            </button>
                        ))}
                    </div>
                    {loading ? (
                        <div className="loader-wrap"><div className="loader" /></div>
                    ) : (
                        <div className="product-grid">
                            {(tabProducts[activeTab] && tabProducts[activeTab].length > 0) ? (
                                tabProducts[activeTab].map(p => (
                                    <ProductCard key={p._id} product={p} onQuickView={setQuickView} />
                                ))
                            ) : (
                                // Fallback to ALL products if featured/trending/etc are empty
                                featured.all && featured.all.length > 0 ? (
                                    featured.all.map(p => (
                                        <ProductCard key={p._id} product={p} onQuickView={setQuickView} />
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                                        No products found in this category yet.
                                    </div>
                                )
                            )}
                        </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                        <button className="btn btn-outline btn-lg" onClick={() => navigate('/products')}>
                            View All Products →
                        </button>
                    </div>
                </div>
            </section>

            {/* Promo Banners */}
            <section className="promo-section container">
                <div className="promo-grid">
                    <div className="promo-card promo-1" onClick={() => navigate('/products?category=cricket')}>
                        <div>
                            <div className="promo-eyebrow">Cricket Season</div>
                            <h3 className="promo-title">Up to 30% OFF</h3>
                            <p className="promo-sub">On all cricket equipment</p>
                            <button className="btn btn-primary btn-sm">Shop Cricket</button>
                        </div>
                    </div>
                    <div className="promo-card promo-2" onClick={() => navigate('/products?category=running-shoes')}>
                        <div>
                            <div className="promo-eyebrow">New Arrivals</div>
                            <h3 className="promo-title">Running Shoes</h3>
                            <p className="promo-sub">Latest collection for runners</p>
                            <button className="btn btn-outline btn-sm">Explore Now</button>
                        </div>
                    </div>
                    <div className="promo-card promo-3" onClick={() => navigate('/products?category=gym-equipment')}>
                        <div>
                            <div className="promo-eyebrow">Build Your Gym</div>
                            <h3 className="promo-title">Gym Equipment</h3>
                            <p className="promo-sub">Premium home gym setups</p>
                            <button className="btn btn-outline btn-sm">View Deals</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Reviews */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">What Our Customers Say</h2>
                        <p className="section-subtitle">Trusted by thousands of athletes across Pakistan</p>
                    </div>
                    <div className="reviews-grid">
                        {REVIEWS.map((r, i) => (
                            <ReviewCard key={i} review={r} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-box">
                        <h2>🔔 Stay in the Game</h2>
                        <p>Subscribe to get the latest deals and sports news delivered to your inbox.</p>
                        <form className="newsletter-form-row" onSubmit={e => { e.preventDefault(); alert('Subscribed! 🎉'); setEmail(''); }}>
                            <input type="email" placeholder="Enter your email address" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                            <button type="submit" className="btn btn-primary">Subscribe</button>
                        </form>
                    </div>
                </div>
            </section>

            {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
        </div>
    );
}
