import { useEffect, useState } from 'react';
import { userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import StatePanel from '../components/StatePanel';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const { user } = useAuth();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    userService.wishlist().then((r) => setProducts(r.wishlist)).catch((e) => setError(getErrorMessage(e)));
  }, [user]);

  if (!user) {
    return <StatePanel icon="💛" title="Sign in to see your wishlist" message="Create an account or sign in to save products for later." actionLabel="Sign in" actionTo="/login" />;
  }
  if (error) return <StatePanel tone="error" title="Couldn't load your wishlist" message={error} />;
  if (!products) return <div className="container" style={{ paddingTop: 32 }}><ProductGridSkeleton count={4} /></div>;
  if (products.length === 0) {
    return <StatePanel icon="💛" title="Your wishlist is empty" message="Tap the heart icon on any product to save it here." actionLabel="Browse products" actionTo="/shop" />;
  }

  return (
    <div className="container section">
      <div className="section-head"><h2>Your wishlist</h2></div>
      <div className="product-grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
    </div>
  );
}
