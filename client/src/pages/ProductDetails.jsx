import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { discountPercent, finalPrice, money, shortDate } from '../utils/format';
import Rating from '../components/Rating';
import ProductCard from '../components/ProductCard';
import StatePanel from '../components/StatePanel';
import { Spinner } from '../components/Skeleton';
import { HeartIcon, MinusIcon, PlusIcon, ReturnIcon, ShieldIcon, TruckIcon } from '../components/Icons';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useDocumentTitle(product?.name);

  useEffect(() => {
    let cancelled = false;
    setProduct(null); setError(null); setActiveImg(0); setQty(1); setTab('description');
    productService.get(id)
      .then((r) => { if (cancelled) return; setProduct(r.product);
        productService.list({ category: r.product.category?._id, limit: 5 }).then((rr) => !cancelled && setRelated(rr.products.filter((p) => p._id !== id).slice(0, 4)));
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e, 'Product not found.')));
    productService.reviews(id).then((r) => !cancelled && setReviews(r.reviews)).catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  if (error) return <StatePanel tone="error" title="Product not found" message={error} actionLabel="Back to shop" actionTo="/shop" />;
  if (!product) return <Spinner label="Loading product" />;

  const saved = wishlist.has(product._id);
  const soldOut = product.stock === 0;
  const low = product.stock > 0 && product.stock <= 5;

  const addToCart = () => { cart.add(product, qty); toast.success(`${product.name} added to your cart.`); };
  const buyNow = () => { cart.add(product, qty); navigate('/cart'); };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true); setReviewError(null);
    try {
      const r = await productService.addReview(id, reviewForm);
      setReviews((prev) => [r.review, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Thanks for your review!');
      productService.get(id).then((rr) => setProduct(rr.product));
    } catch (err) {
      setReviewError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyReviewed = user && reviews.some((r) => r.user?._id === user._id || r.user === user._id);

  return (
    <div className="container">
      <p className="small muted" style={{ margin: '18px 0 0' }}>
        <Link to="/shop">Shop</Link> / <Link to={`/shop?category=${product.category?.slug}`}>{product.category?.name}</Link> / {product.name}
      </p>

      <div className="pdp">
        <div>
          <div className="pdp-gallery-main"><img src={product.images[activeImg]} alt={product.name} /></div>
          <div className="pdp-thumbs">
            {product.images.map((img, i) => (
              <button key={img} type="button" className={i === activeImg ? 'active' : ''} onClick={() => setActiveImg(i)} aria-label={`Show image ${i + 1}`}>
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          <Link className="category-link" to={`/shop?category=${product.category?.slug}`}>{product.category?.name}</Link>
          <h1>{product.name}</h1>
          <Rating value={product.rating} count={product.numReviews} size={17} />
          <div className="price-lg">
            <strong>{money(finalPrice(product))}</strong>
            {discountPercent(product) > 0 && (<><s style={{ marginLeft: 10 }}>{money(product.price)}</s><span className="badge badge-sale" style={{ marginLeft: 8 }}>{discountPercent(product)}% off</span></>)}
          </div>

          <p className={`stock-line ${soldOut ? 'out' : low ? 'low' : 'in'}`}>
            {soldOut ? 'Out of stock' : low ? `Only ${product.stock} left in stock` : 'In stock'}
          </p>

          <p>{product.description}</p>

          {!soldOut && (
            <div className="qty-row">
              <div className="qty-control">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}><MinusIcon width={16} height={16} /></button>
                <span>{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}><PlusIcon width={16} height={16} /></button>
              </div>
              <span className="small muted">{product.stock} available</span>
            </div>
          )}

          <div className="pdp-actions">
            <button className="btn btn-primary btn-lg" disabled={soldOut} onClick={addToCart}>Add to Cart</button>
            <button className="btn btn-secondary btn-lg" disabled={soldOut} onClick={buyNow}>Buy Now</button>
            <button className={`btn btn-ghost btn-lg ${saved ? 'active' : ''}`} onClick={() => wishlist.toggle(product._id)} aria-pressed={saved}>
              <HeartIcon fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          <div className="trust-row">
            <div><TruckIcon width={18} height={18} /> Free shipping over $100</div>
            <div><ReturnIcon width={18} height={18} /> 30-day demo returns</div>
            <div><ShieldIcon width={18} height={18} /> Secure checkout</div>
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'description'} className={tab === 'description' ? 'active' : ''} onClick={() => setTab('description')}>Description</button>
        <button role="tab" aria-selected={tab === 'reviews'} className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>Reviews ({product.numReviews})</button>
      </div>

      {tab === 'description' && <p style={{ maxWidth: '70ch' }}>{product.description}</p>}

      {tab === 'reviews' && (
        <div style={{ maxWidth: '70ch', paddingBottom: 40 }}>
          {user && !alreadyReviewed && (
            <form className="review-form" onSubmit={submitReview}>
              <h4 style={{ marginTop: 0 }}>Write a review</h4>
              {reviewError && <div className="form-alert">{reviewError}</div>}
              <div className="field">
                <label>Your rating</label>
                <Rating value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} size={20} />
              </div>
              <div className="field">
                <label htmlFor="comment">Your review</label>
                <textarea id="comment" required minLength={3} maxLength={1000} rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} placeholder="Share what you thought about this product" />
              </div>
              <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</button>
            </form>
          )}
          {!user && <p className="muted"><Link to="/login" state={{ from: `/product/${id}` }}>Sign in</Link> to leave a review.</p>}
          {alreadyReviewed && <p className="muted">You've already reviewed this product — thanks!</p>}

          <div className="review-list">
            {reviews.length === 0 && <p className="muted">No reviews yet. Be the first to share your thoughts.</p>}
            {reviews.map((r) => (
              <div key={r._id} className="review-item">
                <div className="review-head">
                  <div className="review-avatar">{r.user?.name?.charAt(0) || '?'}</div>
                  <div>
                    <div className="review-name">{r.user?.name || 'ShopSphere customer'}</div>
                    <Rating value={r.rating} size={13} />
                  </div>
                  <span className="small muted" style={{ marginLeft: 'auto' }}>{shortDate(r.createdAt)}</span>
                </div>
                <p style={{ margin: 0 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head"><h2>You may also like</h2></div>
          <div className="product-grid">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
