import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API, { IMG_BASE } from '../services/api';
import toast from 'react-hot-toast';

// Image base URL is dynamic

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        shipping_address: user?.address || '',
        city: '',
        notes: '',
    });
    const [placing, setPlacing] = useState(false);

    const shipping = cartTotal > 5000 ? 0 : 250;
    const grandTotal = cartTotal + shipping;

    if (!user) return (
        <div style={{ paddingTop: '90px', textAlign: 'center', padding: '8rem 2rem' }}>
            <h2 style={{ fontFamily: 'Rajdhani', fontSize: '2rem', marginBottom: '1rem' }}>Login Required</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please login to complete your order.</p>
            <Link to="/login" className="btn btn-primary">Login Now</Link>
        </div>
    );

    if (cart.length === 0) navigate('/cart');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPlacing(true);
        try {
            const items = cart.map(i => {
                const p = i.product;
                return {
                    product_id: p?._id || p,
                    product_name: p?.name || 'Product',
                    product_image: p?.images?.[0] || '',
                    price: p?.discount_price || p?.price || 0,
                    quantity: i.quantity,
                };
            });
            const { data } = await API.post('/orders', { ...form, items });
            toast.success('Order placed successfully! 🎉');
            navigate(`/order-success?order=${data.orderNumber}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div style={{ paddingTop: '90px', paddingBottom: '4rem' }}>
            <div className="container">
                <h1 style={{ fontFamily: 'Rajdhani', fontSize: '2.2rem', marginBottom: '2rem' }}>Checkout</h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
                        {/* Form */}
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '1.4rem', marginBottom: '1.5rem' }}>📦 Shipping Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input className="form-control" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required placeholder="Your full name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address *</label>
                                    <input className="form-control" type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} required placeholder="your@email.com" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input className="form-control" value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} required placeholder="+92 3XX XXXXXXX" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input className="form-control" value={form.city} onChange={e => set('city', e.target.value)} required placeholder="Karachi, Lahore..." />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Full Shipping Address *</label>
                                <textarea className="form-control" rows={3} value={form.shipping_address} onChange={e => set('shipping_address', e.target.value)} required placeholder="Street, Area, City..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Order Notes (Optional)</label>
                                <textarea className="form-control" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special instructions..." />
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="card" style={{ padding: '1.75rem' }}>
                                <h3 style={{ fontFamily: 'Rajdhani', fontSize: '1.4rem', marginBottom: '1.25rem' }}>Order Summary</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                    {cart.map(item => {
                                        const p = item.product;
                                        const img = p?.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : IMG_BASE + p.images[0]) : '';
                                        return (
                                            <div key={item._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                {img && <img src={img} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />}
                                                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{p?.name}</div>
                                                    <div style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                                                </div>
                                                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>
                                                    Rs. {Number((p?.discount_price || p?.price || 0) * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="divider" />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><span>Subtotal</span><span>Rs. {Number(cartTotal).toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span></div>
                                <div className="divider" />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                                    <span>Grand Total</span>
                                    <span style={{ color: 'var(--accent)', fontFamily: 'Rajdhani', fontSize: '1.4rem' }}>Rs. {Number(grandTotal).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>💳 Cash on Delivery only. No online payment required.</p>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={placing}>
                                {placing ? 'Placing Order...' : '✓ Place Order'}
                            </button>
                            <Link to="/cart" className="btn btn-ghost w-full" style={{ textAlign: 'center' }}>← Back to Cart</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
