export const ProductCardSkeleton = () => (
  <div className="card-product skeleton-card" aria-hidden="true">
    <div className="skeleton" style={{ aspectRatio: '1 / 1' }} />
    <div className="card-body">
      <div className="skeleton" style={{ height: 12, width: '40%' }} />
      <div className="skeleton" style={{ height: 16, width: '85%' }} />
      <div className="skeleton" style={{ height: 14, width: '55%' }} />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="product-grid" aria-busy="true" aria-label="Loading products">
    {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);

export const Spinner = ({ label = 'Loading' }) => (
  <div className="spinner-wrap" role="status"><span className="spinner" /><span className="sr-only">{label}</span></div>
);
