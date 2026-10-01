import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { categoryService, newsletterService, productService } from '../services';
import { getErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import StatePanel from '../components/StatePanel';
import Rating from '../components/Rating';
import { ShieldIcon, TruckIcon, ReturnIcon } from '../components/Icons';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const REVIEWS = [
  { name: 'Hannah Price', rating: 5, text: 'The checkout was fast and my order arrived exactly when it said it would. Genuinely impressed by how smooth everything felt.' },
  { name: 'Marcus Webb', rating: 5, text: 'Product quality matched the photos and the descriptions were spot on. Already back for a second order.' },
  { name: 'Priya Nair', rating: 4, text: "Great range of categories and easy filtering, so I found what I needed in minutes instead of scrolling forever." },
];

export default function Home() {
  useDocumentTitle('Home');
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.categories)).catch(() => {});
    productService.list({ featured: 'true', limit: 8 }).then((r) => setFeatured(r.products)).catch((e) => setError(getErrorMessage(e)));
    productService.list({ sort: 'popular', limit: 8 }).then((r) => setTrending(r.products)).catch(() => setTrending([]));
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      await newsletterService.subscribe(email);
      toast.success('Thanks for subscribing! Check your inbox for a welcome email.');
      setEmail('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1>Discover Products You&rsquo;ll Love</h1>
            <p className="lead">Shop smarter. Find better. Delivered to your door.</p>
            <div className="hero-actions">
              <Link className="btn btn-secondary btn-lg" to="/shop">Shop Now</Link>
              <Link className="btn btn-outline btn-lg" to="/shop?sort=newest">Explore Collections</Link>
            </div>
            <div className="hero-stats">
              <div><strong>20k+</strong><span>Happy customers</span></div>
              <div><strong>24</strong><span>Curated products</span></div>
              <div><strong>4.8/5</strong><span>Average rating</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card" style={{ top: '6%', left: '4%', width: '58%' }}>
              <Rating value={5} />
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>&ldquo;Arrived early, packed beautifully.&rdquo;</p>
            </div>
            <div className="hero-card" style={{ bottom: '8%', right: '2%', width: '54%' }}>
              <span className="small muted">Free shipping</span>
              <strong style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 22 }}>Over $100</strong>
            </div>
            <div className="hero-orb" style={{ width: 220, height: 220, background: 'var(--saffron)', top: '30%', right: '10%' }} />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head"><h2>Shop by category</h2></div>
        <div className="category-grid">
          {categories.length === 0 && Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton category-card" />)}
          {categories.map((c) => (
            <Link key={c._id} to={`/shop?category=${c.slug}`} className="category-card">
              <img src={c.image} alt="" />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Featured products</h2>
          <Link className="btn btn-ghost btn-sm" to="/shop?featured=true">View all</Link>
        </div>
        {error && <StatePanel tone="error" title="Couldn't load products" message={error} />}
        {!error && !featured && <ProductGridSkeleton count={8} />}
        {featured && featured.length === 0 && <StatePanel title="No featured products yet" message="Check back soon, or browse the full shop." actionLabel="Go to shop" actionTo="/shop" />}
        {featured && featured.length > 0 && (
          <div className="product-grid">{featured.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </section>

      <section className="section container">
        <div className="promo">
          <div>
            <span className="promo-pct">Up to 30% off</span>
            <h2>Winter refresh, on us</h2>
            <p style={{ color: 'var(--pine-dark)', maxWidth: '40ch' }}>Selected outerwear, home essentials and accessories are discounted for a limited time.</p>
          </div>
          <Link className="btn btn-primary btn-lg" to="/shop?sort=price-asc">Shop the offer</Link>
        </div>
      </section>

      <section className="section container">
        <div className="section-head"><h2>Trending now</h2></div>
        {!trending && <ProductGridSkeleton count={8} />}
        {trending && trending.length > 0 && (
          <div className="product-grid">{trending.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </section>

      <section className="section container">
        <div className="section-head"><h2>What customers say</h2></div>
        <div className="review-grid">
          {REVIEWS.map((r) => (
            <div key={r.name} className="review-card">
              <div className="review-head">
                <div className="review-avatar">{r.name.charAt(0)}</div>
                <div>
                  <div className="review-name">{r.name}</div>
                  <Rating value={r.rating} size={13} />
                </div>
              </div>
              <p style={{ margin: 0 }}>{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 24 }}>
        <div className="review-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="trust-row" style={{ borderTop: 'none' }}><TruckIcon /> Free shipping over $100</div>
          <div className="trust-row" style={{ borderTop: 'none' }}><ReturnIcon /> 30-day demo returns</div>
          <div className="trust-row" style={{ borderTop: 'none' }}><ShieldIcon /> Secure checkout</div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="newsletter">
          <h2>Get the first look at new arrivals</h2>
          <p style={{ color: 'rgba(255,255,255,.75)' }}>One email a week. No spam, unsubscribe any time.</p>
          <form onSubmit={subscribe}>
            <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
            <button className="btn btn-secondary" disabled={subscribing}>{subscribing ? 'Subscribing…' : 'Subscribe'}</button>
          </form>
        </div>
      </section>
    </>
  );
}
