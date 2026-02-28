import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState({ name: '', slug: '', description: '', image: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await API.get('/admin/categories');
        setCategories(res.data);
        setLoading(false);
    };

    const handleEdit = (c) => {
        setEditingCategory(c);
        setForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image || '' });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category? This might affect products in this category.')) {
            try {
                await API.delete(`/admin/categories/${id}`);
                toast.success('Category deleted');
                fetchCategories();
            } catch (err) {
                toast.error('Failed to delete category');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await API.put(`/admin/categories/${editingCategory._id}`, form);
                toast.success('Category updated');
            } else {
                await API.post('/admin/categories', form);
                toast.success('Category created');
            }
            setShowModal(false);
            setEditingCategory(null);
            setForm({ name: '', slug: '', description: '', image: '' });
            fetchCategories();
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-categories">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3>Categories</h3>
                <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setShowModal(true); }}>+ Add Category</button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Products Count</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c._id}>
                                <td>{c._id}</td>
                                <td>{c.name}</td>
                                <td>{c.slug}</td>
                                <td>{c.product_count || 0}</td>
                                <td className="actions-cell">
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                                    <button className="btn btn-ghost btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
                        <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Category Name</label>
                                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Slug</label>
                                <input className="form-control" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image URL (Optional)</label>
                                <input className="form-control" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingCategory ? 'Update' : 'Create'}</button>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
