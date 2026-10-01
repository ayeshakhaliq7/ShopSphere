export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
      {numbers.map((n, i) => (
        <span key={n} className="page-wrap">
          {i > 0 && n - numbers[i - 1] > 1 && <span className="muted">…</span>}
          <button className={`page-btn ${n === page ? 'active' : ''}`} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button>
        </span>
      ))}
      <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}
