import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { discountPercent } from '../utils/format';
import PriceTag from './PriceTag';
import Rating from './Rating';
import { CartIcon, HeartIcon } from './Icons';

export default function ProductCard({ product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const saved = wishlist.has(product._id);
  const soldOut = product.stock === 0;
  const pct = discountPercent(product);

  const addToCart = () => {
    cart.add(product, 1);
    toast.success(`${product.name} added to your cart.`);
  };

  return (
    <article className="card-product">
      <div className="card-media">
        <Link to={`/product/${product._id}`} aria-label={`View ${product.name}`}>
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        </Link>
        {pct > 0 && <span className="badge badge-sale corner">{pct}% off</span>}
        {soldOut && <span className="badge badge-muted corner">Sold out</span>}
        <button
          type="button" className={`icon-btn wish ${saved ? 'active' : ''}`}
          aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => wishlist.toggle(product._id)}
        >
          <HeartIcon fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="card-body">
        <span className="muted small">{product.category?.name}</span>
        <h3><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
        <Rating value={product.rating} count={product.numReviews} />
        <PriceTag product={product} />
        <div className="card-actions">
          <button className="btn btn-primary btn-sm" disabled={soldOut} onClick={addToCart}>
            <CartIcon width={16} height={16} /> {soldOut ? 'Sold out' : 'Add to cart'}
          </button>
          <Link className="btn btn-ghost btn-sm" to={`/product/${product._id}`}>View details</Link>
        </div>
      </div>
    </article>
  );
}
