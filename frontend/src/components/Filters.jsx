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

export default function Filters({ filters, setFilter, clearFilters, sidebarOpen }) {
    return (
        <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="filters-header">
                <h3>Filters</h3>
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
            </div>

            <div className="filter-group">
                <h4>Category</h4>
                {CATEGORIES.map(c => (
                    <label key={c.slug} className={`filter-option ${filters.category === c.slug ? 'active' : ''}`}>
                        <input type="radio" name="category" checked={filters.category === c.slug} onChange={() => setFilter('category', c.slug)} />
                        {c.name}
                    </label>
                ))}
            </div>

            <div className="filter-group">
                <h4>Price Range (Rs.)</h4>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="number" className="form-control" placeholder="Min" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} style={{ padding: '0.5rem' }} />
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                    <input type="number" className="form-control" placeholder="Max" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} style={{ padding: '0.5rem' }} />
                </div>
            </div>

            <div className="filter-group">
                <h4>Brand</h4>
                {BRANDS.map(b => (
                    <label key={b} className={`filter-option ${filters.brand === b ? 'active' : ''}`}>
                        <input type="radio" name="brand" checked={filters.brand === b} onChange={() => setFilter('brand', filters.brand === b ? '' : b)} />
                        {b}
                    </label>
                ))}
            </div>

            <div className="filter-group">
                <h4>Minimum Rating</h4>
                {[4, 3, 2, 1].map(r => (
                    <label key={r} className={`filter-option ${filters.rating == r ? 'active' : ''}`}>
                        <input type="radio" name="rating" checked={filters.rating == r} onChange={() => setFilter('rating', filters.rating == r ? '' : r)} />
                        {'★'.repeat(r)}{'☆'.repeat(5 - r)} & up
                    </label>
                ))}
            </div>

            <div className="filter-group">
                <label className="filter-option">
                    <input type="checkbox" checked={filters.inStock} onChange={e => setFilter('inStock', e.target.checked)} />
                    In Stock Only
                </label>
            </div>
        </aside>
    );
}
