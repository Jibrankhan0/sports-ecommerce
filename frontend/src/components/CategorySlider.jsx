import { Link } from 'react-router-dom';

const CATEGORIES = [
    { name: 'Cricket', slug: 'cricket', icon: '🏏', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300' },
    { name: 'Football', slug: 'football', icon: '⚽', img: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=300' },
    { name: 'Badminton', slug: 'badminton', icon: '🏸', img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300' },
    { name: 'Tennis', slug: 'tennis', icon: '🎾', img: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=300' },
    { name: 'Gym', slug: 'gym-equipment', icon: '🏋️', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
    { name: 'Running', slug: 'running-shoes', icon: '👟', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
    { name: 'Accessories', slug: 'sports-accessories', icon: '🎽', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300' },
];

export default function CategorySlider() {
    return (
        <div className="cat-slider">
            {CATEGORIES.map(cat => (
                <Link key={cat.slug} to={`/products?category=${cat.slug}`} className="cat-card">
                    <div className="cat-img-wrap">
                        <img src={cat.img} alt={cat.name} loading="lazy" />
                        <div className="cat-overlay" />
                        <span className="cat-icon">{cat.icon}</span>
                    </div>
                    <div className="cat-name">{cat.name}</div>
                </Link>
            ))}
        </div>
    );
}
