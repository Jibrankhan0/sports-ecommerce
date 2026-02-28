import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import Filters from '../components/Filters';
import './Products.css';

const BRANDS = ['Nike', 'Adidas', 'Puma', 'Yonex', 'Wilson', 'Li-Ning', 'SG', 'Kookaburra', 'Gray-Nicolls', 'PowerFlex', 'FitPro', 'RopeKing', 'ZenFit'];
const CATEGORIES = [
    { name: 'All', slug: '' },
    { name: 'Cricket', slug: 'cricket' },
    { name: 'Football', slug: 'football' },
    { name: 'Badminton', slug: 'badminton' },
    { name: 'Tennis', slug: 'tennis' },
    { name: 'Gym Equipment', slug: 'gym-equipment' },
    { name: 'Running Shoes', slug: 'running-shoes' },
    { name: 'Sports Accessories', slug: 'sports-accessories' },
];

export default function Products() {
    const [params, setParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [quickView, setQuickView] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [filters, setFilters] = useState({
        category: params.get('category') || '',
        brand: params.get('brand') || '',
        minPrice: params.get('minPrice') || '',
        maxPrice: params.get('maxPrice') || '',
        rating: params.get('rating') || '',
        inStock: params.get('inStock') === 'true',
        sort: params.get('sort') || 'newest',
        search: params.get('search') || '',
        page: 1,
    });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v !== false) q.append(k, v); });
            const { data } = await API.get(`/products?${q}`);
            setProducts(data.products);
            setTotal(data.total);
            setPages(data.pages);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
    const clearFilters = () => setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', rating: '', inStock: false, sort: 'newest', search: '', page: 1 });

    return (
        <div className="products-page" style={{ paddingTop: '90px' }}>
            <div className="container">
                {/* Header */}
                <div className="products-header">
                    <div>
                        <h1 style={{ fontFamily: 'Rajdhani', fontSize: '2rem' }}>
                            {filters.category ? CATEGORIES.find(c => c.slug === filters.category)?.name || 'Products' : filters.search ? `Results for "${filters.search}"` : 'All Products'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{total} products found</p>
                    </div>
                    <div className="sort-bar">
                        <select className="form-control" style={{ width: 'auto', padding: '0.55rem 1rem' }} value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Top Rated</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                        <button className="btn btn-outline btn-sm" onClick={() => setSidebarOpen(p => !p)}>⚙ Filters</button>
                    </div>
                </div>

                <div className="products-layout">
                    <Filters
                        filters={filters}
                        setFilter={setFilter}
                        clearFilters={clearFilters}
                        sidebarOpen={sidebarOpen}
                        BRANDS={BRANDS}
                        CATEGORIES={CATEGORIES}
                        onCloseSidebar={() => setSidebarOpen(false)}
                    />
                    {/* Products Grid */}
                    <div className="products-main">
                        {loading ? (
                            <div className="loader-wrap"><div className="loader" /></div>
                        ) : products.length === 0 ? (
                            <div className="no-products">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                <h3>No products found</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
                                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={clearFilters}>Clear Filters</button>
                            </div>
                        ) : (
                            <>
                                <div className="product-grid">
                                    {products.map(p => <ProductCard key={p._id} product={p} onQuickView={setQuickView} />)}
                                </div>
                                {pages > 1 && (
                                    <div className="pagination">
                                        {Array.from({ length: pages }, (_, i) => (
                                            <button key={i + 1} className={`page-btn ${filters.page === i + 1 ? 'active' : ''}`}
                                                onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}>{i + 1}</button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
        </div>
    );
}
