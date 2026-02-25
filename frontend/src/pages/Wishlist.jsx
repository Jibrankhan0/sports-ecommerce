import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
    const { wishlist } = useWishlist();

    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="container">
                <h1 style={{ fontFamily: 'Rajdhani', marginBottom: '2rem' }}>My Wishlist</h1>
                {wishlist.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Your wishlist is empty.</p>
                    </div>
                ) : (
                    <div className="product-grid">
                        {wishlist.map(item => (
                            <ProductCard
                                key={item.product_id}
                                product={{
                                    id: item.product_id,
                                    name: item.name,
                                    price: item.price,
                                    discount_price: item.discount_price,
                                    images: item.images,
                                    rating: item.rating,
                                    stock: item.stock,
                                    category_name: item.category
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
