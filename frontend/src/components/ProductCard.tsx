import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import type { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { add } = useCart();
  const { add: addWishlist, remove: removeWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product._id);
  const shortDescription =
    product.description.length > 90
      ? `${product.description.slice(0, 90).trim()}…`
      : product.description;

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info('Login to save favorites');
      return;
    }
    if (inWishlist) await removeWishlist(product._id);
    else await addWishlist(product._id);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Login to add items to cart');
      return;
    }
    if (product.stock === 0) return;
    await add(product._id);
  };

  return (
    <article className="pcard">
      <div className="pcard-media">
        <Link to={`/shop/${product._id}`} className="pcard-media-link">
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        </Link>
        {(product.isFeatured || product.sold > 20) && (
          <span className="pcard-badge">{product.isFeatured ? 'Featured' : 'Trending'}</span>
        )}
        <button
          type="button"
          className={`pcard-wish ${inWishlist ? 'active' : ''}`}
          onClick={() => void handleWishlist()}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="pcard-body">
        <h3 className="pcard-title">
          <Link to={`/shop/${product._id}`}>{product.name}</Link>
        </h3>
        <p className="pcard-desc">{shortDescription}</p>

        <div className="pcard-footer">
          <div className="pcard-price">{formatPrice(product.price)}</div>
          <button
            type="button"
            className="pcard-cart"
            disabled={product.stock === 0}
            onClick={() => void handleAddToCart()}
          >
            {product.stock === 0 ? 'Out of stock' : 'Add To Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
