import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { userService } from '../services';
import { getErrorMessage } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    userService.wishlist().then((r) => setIds(new Set(r.wishlist.map((p) => p._id)))).catch(() => {});
  }, [user]);

  const toggle = useCallback(async (productId) => {
    if (!user) { toast.info('Sign in to save items to your wishlist.'); return false; }
    const has = ids.has(productId);
    setIds((prev) => { const n = new Set(prev); has ? n.delete(productId) : n.add(productId); return n; }); // optimistic
    try {
      await (has ? userService.removeWishlist(productId) : userService.addWishlist(productId));
      toast.success(has ? 'Removed from wishlist.' : 'Saved to wishlist.');
    } catch (err) {
      setIds((prev) => { const n = new Set(prev); has ? n.add(productId) : n.delete(productId); return n; });
      toast.error(getErrorMessage(err));
    }
    return true;
  }, [user, ids, toast]);

  const value = useMemo(() => ({ ids, count: ids.size, has: (id) => ids.has(id), toggle }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
