import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            API.get('/orders/my').then(res => {
                setOrders(res.data);
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) return <div className="loader-wrap"><div className="loader" /></div>;

    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="container">
                <h1 style={{ fontFamily: 'Rajdhani', marginBottom: '2rem' }}>Order History</h1>
                {orders.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order._id} className="card order-card">
                                <div className="order-header">
                                    <div>
                                        <span className="order-number">#{order.order_number}</span>
                                        <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="order-items">
                                    {order.items.map(item => (
                                        <div key={item._id} className="order-item">
                                            <img src={item.product_image?.startsWith('http') ? item.product_image : `http://localhost:5000${item.product_image}`} alt={item.product_name} />
                                            <div className="item-details">
                                                <div className="item-name">{item.product_name}</div>
                                                <div className="item-qty">Qty: {item.quantity} × Rs. {Number(item.price).toLocaleString()}</div>
                                            </div>
                                            <div className="item-subtotal">Rs. {Number(item.price * item.quantity).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-footer">
                                    <div className="order-total">
                                        Total Amount: <span>Rs. {Number(order.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
