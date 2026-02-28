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
            <div style={{ marginBottom: '1.5rem' }}>
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
                                    <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{o.customer_email}</div>
                                </td>
                                <td>Rs. {Number(o.total).toLocaleString()}</td>
                                <td>
                                    <span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'danger' : 'warning'}`}>
                                        {o.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => viewOrder(o)}>View</button>
                                        <select className="form-control btn-sm" style={{ width: 'auto', padding: '0.2rem' }} value={o.status} onChange={(e) => handleStatusUpdate(o.id, e.target.value)}>
                                            <option value="pending">P</option>
                                            <option value="proc">Pr</option>
                                            <option value="ship">Sh</option>
                                            <option value="del">De</option>
                                            <option value="can">Ca</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: '800px', width: '95%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 className="modal-title">Order Info: #{selectedOrder.order_number}</h3>
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="responsive-form-grid">
                            <div className="card" style={{ padding: '1rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--accent)', fontSize: '1rem' }}>Customer</h4>
                                <p style={{ fontSize: '0.85rem' }}><strong>Name:</strong> {selectedOrder.customer_name}</p>
                                <p style={{ fontSize: '0.85rem' }}><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                <p style={{ fontSize: '0.85rem' }}><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                            </div>
                            <div className="card" style={{ padding: '1rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--accent)', fontSize: '1rem' }}>Shipping</h4>
                                <p style={{ fontSize: '0.85rem' }}><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                                <p style={{ fontSize: '0.85rem' }}><strong>City:</strong> {selectedOrder.city}</p>
                                <p style={{ fontSize: '0.85rem' }}><strong>Status:</strong> {selectedOrder.status.toUpperCase()}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Items</h4>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.product_name}</td>
                                                <td>{item.quantity}</td>
                                                <td>Rs. {Number(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan="2" style={{ textAlign: 'right' }}><strong>Total</strong></td>
                                            <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Rs. {Number(selectedOrder.total).toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                                <>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}>Deliver</button>
                                    <button className="btn btn-ghost btn-danger btn-sm" onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}>Cancel</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
