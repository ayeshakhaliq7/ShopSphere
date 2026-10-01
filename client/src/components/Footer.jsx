import { Link } from 'react-router-dom';
import Logo from './Logo';

const Social = ({ label, d }) => (
  <a href="#top" className="social" aria-label={label} onClick={(e) => e.preventDefault()}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
  </a>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="footer-about">ShopSphere is a demo store built as a full-stack portfolio project. Products, orders and payments are sample data only.</p>
          <div className="socials">
            <Social label="Facebook" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z" />
            <Social label="Twitter" d="M18.9 3h2.9l-6.3 7.2L23 21h-5.8l-4.5-6-5.2 6H4.6l6.7-7.7L3.9 3h6l4.1 5.5zm-1 16.3h1.6L9.1 4.6H7.4z" />
            <Social label="Instagram" d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 3-3 3 3 0 0 1-3 3zM17 6a1.1 1.1 0 1 0 1.1 1.1A1.1 1.1 0 0 0 17 6zM8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm0 1.7A3.3 3.3 0 0 0 4.7 8v8A3.3 3.3 0 0 0 8 19.3h8a3.3 3.3 0 0 0 3.3-3.3V8A3.3 3.3 0 0 0 16 4.7z" />
            <Social label="LinkedIn" d="M4.5 9h3.7v11.5H4.5zM6.3 3.5a2.1 2.1 0 1 1-2.1 2.1 2.1 2.1 0 0 1 2.1-2.1zM10.3 9h3.5v1.6c.5-.9 1.7-1.9 3.6-1.9 3.800 0 4.500 2.500 4.500 5.700v6.100h-3.700v-5.400c0-1.300 0-2.900-1.800-2.900s-2 1.400-2 2.800v5.500h-3.700z" />
          </div>
        </div>
        <div>
          <h4>Quick links</h4>
          <Link to="/shop">Shop all</Link><Link to="/shop?sort=newest">New arrivals</Link><Link to="/wishlist">Wishlist</Link><Link to="/cart">Cart</Link>
        </div>
        <div>
          <h4>Customer support</h4>
          <Link to="/account?tab=orders">Track an order</Link>
          <span>Free shipping over $100</span><span>30-day returns (demo)</span><span>Help centre (demo)</span>
        </div>
        <div>
          <h4>Contact</h4>
          <span>support@shopsphere.demo</span><span>+1 (555) 010-2030</span><span>Mon-Fri, 9am-6pm</span>
        </div>
      </div>
      <div className="container footer-bottom">&copy; {new Date().getFullYear()} ShopSphere. A portfolio project - no real purchases are made.</div>
    </footer>
  );
}
