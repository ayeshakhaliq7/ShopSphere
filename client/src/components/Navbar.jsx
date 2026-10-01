import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { categoryService } from '../services';
import Logo from './Logo';
import { CartIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(null); // 'categories' | 'user' | null
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const navRef = useRef(null);

  useEffect(() => { categoryService.list().then((r) => setCategories(r.categories)).catch(() => {}); }, []);
  useEffect(() => { setOpen(false); setMenu(null); }, [location.pathname, location.search]);
  useEffect(() => {
    const close = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setMenu(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/shop${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`);
    setQuery('');
  };

  const toggleMenu = (name) => setMenu((m) => (m === name ? null : name));

  return (
    <header className="navbar" ref={navRef}>
      <div className="container nav-inner">
        <button className="icon-btn nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Link to="/" aria-label="ShopSphere home"><Logo /></Link>

        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/shop" end>Shop</NavLink>
          <div className="dropdown">
            <button type="button" aria-expanded={menu === 'categories'} onClick={() => toggleMenu('categories')}>Categories</button>
            {menu === 'categories' && (
              <div className="dropdown-menu">
                {categories.map((c) => <Link key={c._id} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}
                {categories.length === 0 && <span className="muted small pad">No categories yet</span>}
              </div>
            )}
          </div>
          <NavLink to="/wishlist">Wishlist</NavLink>
          <form className="nav-search mobile-only" onSubmit={submitSearch} role="search">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" />
            <button aria-label="Search"><SearchIcon /></button>
          </form>
        </nav>

        <form className="nav-search desktop-only" onSubmit={submitSearch} role="search">
          <SearchIcon width={18} height={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" />
        </form>

        <div className="nav-actions">
          <Link className="icon-btn badge-wrap desktop-only" to="/wishlist" aria-label={`Wishlist, ${wishlist.count} items`}>
            <HeartIcon />{wishlist.count > 0 && <span className="count">{wishlist.count}</span>}
          </Link>
          <Link className="icon-btn badge-wrap" to="/cart" aria-label={`Cart, ${cart.count} items`}>
            <CartIcon />{cart.count > 0 && <span className="count">{cart.count}</span>}
          </Link>
          {user ? (
            <div className="dropdown right">
              <button className="avatar" aria-label="Account menu" aria-expanded={menu === 'user'} onClick={() => toggleMenu('user')}>
                {user.name.charAt(0).toUpperCase()}
              </button>
              {menu === 'user' && (
                <div className="dropdown-menu">
                  <span className="pad small muted">{user.email}</span>
                  <Link to="/account">My account</Link>
                  <Link to="/account?tab=orders">My orders</Link>
                  {isAdmin && <Link to="/admin">Admin dashboard</Link>}
                  <button onClick={() => { logout(); navigate('/'); }}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link className="btn btn-ghost btn-sm" to="/login"><UserIcon width={16} height={16} /> Login</Link>
              <Link className="btn btn-primary btn-sm desktop-only" to="/register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
