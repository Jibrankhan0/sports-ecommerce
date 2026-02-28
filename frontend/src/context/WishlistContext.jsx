import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => { if (user) fetchWishlist(); else setWishlist([]); }, [user]);

    const fetchWishlist = async () => {
        try { const { data } = await API.get('/wishlist'); setWishlist(data); } catch { }
    };

    const addToWishlist = async (product_id) => {
        if (!user) { toast.error('Please login to use wishlist'); return; }
        try {
            await API.post('/wishlist', { product_id });
            await fetchWishlist();
            toast.success('Added to wishlist!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const removeFromWishlist = async (product_id) => {
        try {
            await API.delete(`/wishlist/${product_id}`);
            setWishlist(prev => prev.filter(i => i._id !== product_id));
            toast.success('Removed from wishlist');
        } catch { }
    };

    const isInWishlist = (product_id) => wishlist.some(i => i._id === product_id);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
