import { Link, useSearchParams } from 'react-router-dom';

export default function SuccessPage() {
    const [params] = useSearchParams();
    const orderNum = params.get('order');

    return (
        <div style={{ paddingTop: '100px', textAlign: 'center', paddingBottom: '5rem' }}>
            <div className="container">
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🎉</div>
                    <h1 style={{ fontFamily: 'Rajdhani', fontSize: '2.5rem', marginBottom: '1rem' }}>Order Placed!</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>
                    {orderNum && (
                        <div style={{ background: 'var(--bg-card2)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Order Number:</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Rajdhani', color: 'var(--accent)' }}>#{orderNum}</div>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/orders" className="btn btn-primary">View My Orders</Link>
                        <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
