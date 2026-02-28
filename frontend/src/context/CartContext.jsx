import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (user) fetchCart(); else setCart([]); }, [user]);

    const fetchCart = async () => {
        try {
            const { data } = await API.get('/cart');
            setCart(data);
        } catch (err) { console.error(err); }
    };

    const addToCart = async (product_id, quantity = 1) => {
        if (!user) { toast.error('Please login to add to cart'); return false; }
        setLoading(true);
        try {
            await API.post('/cart', { product_id, quantity });
            await fetchCart();
            toast.success('Added to cart!');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
            return false;
        } finally { setLoading(false); }
    };

    const updateQuantity = async (cartId, quantity) => {
        try {
            await API.put(`/cart/${cartId}`, { quantity });
            await fetchCart();
        } catch (err) { toast.error('Failed to update quantity'); }
    };

    const removeFromCart = async (cartId) => {
        try {
            await API.delete(`/cart/${cartId}`);
            setCart(prev => prev.filter(i => (i.product?._id || i.product) !== cartId));
            toast.success('Removed from cart');
        } catch (err) { toast.error('Failed to remove item'); }
    };

    const clearCart = async () => {
        try { await API.delete('/cart'); setCart([]); } catch { }
    };

    const cartTotal = cart.reduce((s, i) => s + ((i.product?.discount_price || i.product?.price || 0) * i.quantity), 0);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, loading, cartTotal, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
