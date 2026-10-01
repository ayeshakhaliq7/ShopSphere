export default function Logo() {
  return (
    <span className="logo">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="var(--pine)" />
        <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="var(--saffron)" strokeWidth="2" transform="rotate(-20 16 16)" />
      </svg>
      ShopSphere
    </span>
  );
}
