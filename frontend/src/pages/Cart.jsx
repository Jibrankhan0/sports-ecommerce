import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const BASE = 'http://localhost:5000';

export default function Cart() {
    const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) return (
        <div style={{ paddingTop: '90px', textAlign: 'center', padding: '8rem 2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🛒</div>
            <h2 style={{ fontFamily: 'Rajdhani', fontSize: '2rem', marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
    );

    const shipping = cartTotal > 5000 ? 0 : 250;

    return (
        <div style={{ paddingTop: '90px' }}>
            <div className="container" style={{ paddingBottom: '4rem' }}>
                <h1 style={{ fontFamily: 'Rajdhani', fontSize: '2.2rem', marginBottom: '2rem' }}>Shopping Cart <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>({cartCount} items)</span></h1>
                <div className="cart-layout">
                    {/* Items */}
                    <div className="cart-items">
                        {cart.map(item => {
                            const img = item.images?.[0]
                                ? (item.images[0].startsWith('http') ? item.images[0] : BASE + item.images[0])
                                : 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200';
                            const price = item.discount_price || item.price;
                            return (
                                <div key={item.id} className="cart-item card">
                                    <Link to={`/product/${item.product_id}`}>
                                        <img src={img} alt={item.name} className="cart-item-img" />
                                    </Link>
                                    <div className="cart-item-info">
                                        <div className="cart-item-category">{item.category}</div>
                                        <Link to={`/product/${item.product_id}`} className="cart-item-name">{item.name}</Link>
                                        <div className="cart-item-price">Rs. {Number(price).toLocaleString()}</div>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="qty-control">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                                        </div>
                                        <div className="cart-item-subtotal">Rs. {Number(price * item.quantity).toLocaleString()}</div>
                                        <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)} title="Remove">✕</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="cart-summary card">
                        <h2 style={{ fontFamily: 'Rajdhani', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Summary</h2>
                        <div className="summary-row"><span>Subtotal</span><span>Rs. {Number(cartTotal).toLocaleString()}</span></div>
                        <div className="summary-row"><span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span></div>
                        {shipping > 0 && <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Free shipping on orders over Rs. 5,000</p>}
                        <div className="divider" />
                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span style={{ color: 'var(--accent)' }}>Rs. {Number(cartTotal + shipping).toLocaleString()}</span>
                        </div>
                        <button className="btn btn-primary btn-lg w-full" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/checkout')}>
                            Proceed to Checkout →
                        </button>
                        <button className="btn btn-ghost w-full" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/products')}>
                            ← Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
