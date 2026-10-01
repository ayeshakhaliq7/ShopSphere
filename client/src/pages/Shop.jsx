import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoryService, productService } from '../services';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import StatePanel from '../components/StatePanel';
import Pagination from '../components/Pagination';
import { getErrorMessage } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const SORTS = [
  ['newest', 'Newest'],
  ['price-asc', 'Price: Low to High'],
  ['price-desc', 'Price: High to Low'],
  ['rating', 'Highest Rated'],
];
const RATINGS = [4, 3, 2, 1];

export default function Shop() {
  useDocumentTitle('Shop');
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(params.get('search') || '');

  const query = useMemo(() => ({
    search: params.get('search') || undefined,
    category: params.get('category') || undefined,
    minPrice: params.get('minPrice') || undefined,
    maxPrice: params.get('maxPrice') || undefined,
    rating: params.get('rating') || undefined,
    inStock: params.get('inStock') || undefined,
    featured: params.get('featured') || undefined,
    sort: params.get('sort') || 'newest',
    page: params.get('page') || '1',
  }), [params]);

  useEffect(() => { categoryService.list().then((r) => setCategories(r.categories)).catch(() => {}); }, []);
  useEffect(() => { setSearchInput(params.get('search') || ''); }, [params]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productService.list(query)
      .then((r) => !cancelled && setResult(r))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [query]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === '' || value === false) next.delete(key); else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const clearFilters = () => setParams({});

  const activeFilterCount = ['category', 'minPrice', 'maxPrice', 'rating', 'inStock', 'featured'].filter((k) => params.get(k)).length;

  return (
    <div className="container shop-layout">
      <aside className="filters">
        <h4 style={{ marginTop: 0 }}>Filters {activeFilterCount > 0 && <button className="linklike" style={{ color: 'var(--pine)', fontWeight: 700, float: 'right' }} onClick={clearFilters}>Clear</button>}</h4>

        <h4>Category</h4>
        <div className="filter-group">
          <label><input type="radio" name="category" checked={!params.get('category')} onChange={() => setParam('category', undefined)} /> All categories</label>
          {categories.map((c) => (
            <label key={c._id}><input type="radio" name="category" checked={params.get('category') === c.slug} onChange={() => setParam('category', c.slug)} /> {c.name}</label>
          ))}
        </div>

        <h4>Price range</h4>
        <div className="field-row">
          <div className="field"><label htmlFor="minPrice">Min</label><input id="minPrice" type="number" min="0" defaultValue={params.get('minPrice') || ''} onBlur={(e) => setParam('minPrice', e.target.value)} placeholder="$0" /></div>
          <div className="field"><label htmlFor="maxPrice">Max</label><input id="maxPrice" type="number" min="0" defaultValue={params.get('maxPrice') || ''} onBlur={(e) => setParam('maxPrice', e.target.value)} placeholder="$500" /></div>
        </div>

        <h4>Rating</h4>
        <div className="filter-group">
          <label><input type="radio" name="rating" checked={!params.get('rating')} onChange={() => setParam('rating', undefined)} /> Any rating</label>
          {RATINGS.map((r) => <label key={r}><input type="radio" name="rating" checked={params.get('rating') === String(r)} onChange={() => setParam('rating', String(r))} /> {r}★ &amp; up</label>)}
        </div>

        <h4>Availability</h4>
        <div className="filter-group">
          <label><input type="checkbox" checked={params.get('inStock') === 'true'} onChange={(e) => setParam('inStock', e.target.checked ? 'true' : undefined)} /> In stock only</label>
        </div>
      </aside>

      <div>
        <div className="shop-toolbar">
          <form role="search" onSubmit={(e) => { e.preventDefault(); setParam('search', searchInput.trim() || undefined); }} style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 360 }}>
            <input className="search-input" style={{ flex: 1 }} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products" aria-label="Search products" />
            <button className="btn btn-ghost btn-sm">Search</button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {result && <span className="small muted">{result.total} results</span>}
            <select value={query.sort} onChange={(e) => setParam('sort', e.target.value)} aria-label="Sort products">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        {error && <StatePanel tone="error" title="Couldn't load products" message={error} actionLabel="Try again" onAction={() => setParams(new URLSearchParams(params))} />}
        {!error && loading && <ProductGridSkeleton count={9} />}
        {!error && !loading && result && result.products.length === 0 && (
          <StatePanel title="No products found" message="Try adjusting your filters or search for something else." actionLabel="Clear filters" onAction={clearFilters} />
        )}
        {!error && !loading && result && result.products.length > 0 && (
          <>
            <div className="product-grid">{result.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
            <Pagination page={result.page} pages={result.pages} onChange={(p) => setParam('page', String(p))} />
          </>
        )}
      </div>
    </div>
  );
}
