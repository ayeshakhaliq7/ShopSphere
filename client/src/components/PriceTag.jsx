import { discountPercent, finalPrice, money } from '../utils/format';

export default function PriceTag({ product, large = false }) {
  const pct = discountPercent(product);
  return (
    <div className={`price ${large ? 'price-lg' : ''}`}>
      <strong>{money(finalPrice(product))}</strong>
      {pct > 0 && (<><s>{money(product.price)}</s><span className="badge badge-sale">{pct}% off</span></>)}
    </div>
  );
}
