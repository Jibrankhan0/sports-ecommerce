import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const res = await API.get('/admin/orders');
        setOrders(res.data);
        setLoading(false);
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await API.put(`/admin/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchOrders();
            if (selectedOrder) {
                const res = await API.get(`/admin/orders/${id}`);
                setSelectedOrder(res.data);
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const viewOrder = async (order) => {
        try {
            const res = await API.get(`/admin/orders/${order.id}`);
            setSelectedOrder(res.data);
            setShowModal(true);
        } catch (err) {
            toast.error('Failed to load order details');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-orders">
            <div style={{ marginBottom: '2rem' }}>
                <h3>Manage Orders</h3>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td><strong>#{o.order_number}</strong></td>
                                <td>
                                    <div>{o.customer_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{o.customer_email}</div>
                                </td>
                                <td>Rs. {Number(o.total).toLocaleString()}</td>
                                <td>
                                    <span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'danger' : 'warning'}`}>
                                        {o.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <button className="btn btn-ghost btn-sm" onClick={() => viewOrder(o)}>View</button>
                                    <select className="form-control btn-sm" style={{ width: 'auto', padding: '0.2rem' }} value={o.status} onChange={(e) => handleStatusUpdate(o.id, e.target.value)}>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: '800px', width: '90%', padding: '2rem', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Order Details: #{selectedOrder.order_number}</h3>
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--accent)' }}>Customer Info</h4>
                                <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                                <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--accent)' }}>Shipping Info</h4>
                                <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                                <p><strong>City:</strong> {selectedOrder.city}</p>
                                <p><strong>Status:</strong> {selectedOrder.status.toUpperCase()}</p>
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '1rem' }}>Order Items</h4>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.product_name}</td>
                                            <td>Rs. {Number(item.price).toLocaleString()}</td>
                                            <td>{item.quantity}</td>
                                            <td>Rs. {Number(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total</strong></td>
                                        <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Rs. {Number(selectedOrder.total).toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                                <>
                                    <button className="btn btn-primary" onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}>Mark as Delivered</button>
                                    <button className="btn btn-ghost btn-danger" onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}>Cancel Order</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
