import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        name: '', category_id: '', brand: '', price: '', discount_price: '', stock: '', description: '', specifications: ''
    });
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchProducts();
        API.get('/categories').then(res => setCategories(res.data));
    }, []);

    const fetchProducts = async () => {
        const res = await API.get('/admin/products');
        setProducts(res.data);
        setLoading(false);
    };

    const handleEdit = (p) => {
        setEditingProduct(p);
        setForm({
            name: p.name,
            category_id: p.category?._id || p.category || '',
            brand: p.brand,
            price: p.price,
            discount_price: p.discount_price || '',
            stock: p.stock,
            description: p.description,
            specifications: p.specifications || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await API.delete(`/admin/products/${id}`);
                toast.success('Product deleted');
                fetchProducts();
            } catch (err) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));

        if (editingProduct && editingProduct.images) {
            formData.append('existing_images', JSON.stringify(editingProduct.images));
        }

        if (images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                formData.append('images', images[i]);
            }
        }

        try {
            if (editingProduct) {
                await API.put(`/admin/products/${editingProduct._id}`, formData);
                toast.success('Product updated');
            } else {
                await API.post('/admin/products', formData);
                toast.success('Product created');
            }
            setShowModal(false);
            setEditingProduct(null);
            setForm({ name: '', category_id: '', brand: '', price: '', discount_price: '', stock: '', description: '', specifications: '' });
            setImages([]);
            fetchProducts();
        } catch (err) {
            console.error('Operation Error:', err);
            const msg = err.response?.data?.message || 'Operation failed';
            toast.error(msg);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-products">
            <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3>Manage Products</h3>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditingProduct(null); setShowModal(true); }}>+ Add Product</button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p._id}>
                                <td>
                                    <img
                                        src={p.images?.[0]?.startsWith('http') ? p.images[0] : (p.images?.[0] ? `http://localhost:5000${p.images[0]}` : 'https://via.placeholder.com/40')}
                                        alt=""
                                        style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                </td>
                                <td>{p.name}</td>
                                <td>{p.category?.name || 'Uncategorized'}</td>
                                <td>Rs. {Number(p.price).toLocaleString()}</td>
                                <td>{p.stock}</td>
                                <td className="actions-cell">
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                                    <button className="btn btn-ghost btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: '700px', width: '90%' }}>
                        <h3 className="modal-title" style={{ marginBottom: '1rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleSubmit} className="responsive-form-grid">
                            <div className="form-group span-2">
                                <label className="form-label">Product Name</label>
                                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-control" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Brand</label>
                                <input className="form-control" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price (Rs.)</label>
                                <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount Price</label>
                                <input className="form-control" type="number" value={form.discount_price} onChange={e => setForm({ ...form, discount_price: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock Quantity</label>
                                <input className="form-control" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Images</label>
                                <input className="form-control" type="file" multiple onChange={e => setImages(e.target.files)} />
                            </div>
                            <div className="form-group span-2">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
                            </div>
                            <div className="form-group span-2">
                                <label className="form-label">Specifications</label>
                                <input className="form-control" value={form.specifications} onChange={e => setForm({ ...form, specifications: e.target.value })} />
                            </div>
                            <div className="modal-actions span-2" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingProduct ? 'Update' : 'Create'}</button>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
