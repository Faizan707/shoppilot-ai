import { formatPrice } from '../utils/formatPrice';

interface PriceProps {
  amount: number;
  compareAt?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Price({ amount, compareAt, className = '', size = 'md' }: PriceProps) {
  const sizeClass = size === 'lg' ? 'price-lg' : size === 'sm' ? 'price-sm' : '';
  return (
    <span className={`price-wrap ${sizeClass} ${className}`.trim()}>
      <span className="price-current fw-semibold">{formatPrice(amount)}</span>
      {compareAt !== undefined && compareAt > amount && (
        <span className="price-compare text-muted text-decoration-line-through ms-2 small">
          {formatPrice(compareAt)}
        </span>
      )}
    </span>
  );
}
