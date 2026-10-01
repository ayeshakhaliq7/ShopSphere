import { useState } from 'react';
import { StarIcon } from './Icons';

/** Read-only star display, or an accessible radio-group input when `onChange` is passed. */
export default function Rating({ value = 0, count, onChange, size = 16 }) {
  const [hover, setHover] = useState(0);

  if (onChange) {
    return (
      <div className="rating rating-input" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button" key={n} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={n <= (hover || value) ? 'on' : ''}
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}
          >
            <StarIcon width={size + 6} height={size + 6} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className="rating" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5${count != null ? ` from ${count} reviews` : ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? 'on' : ''}><StarIcon width={size} height={size} /></span>
      ))}
      {count != null && <span className="rating-count">({count})</span>}
    </span>
  );
}
