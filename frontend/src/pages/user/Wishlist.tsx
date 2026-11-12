import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ProductCard } from '../../components/ProductCard';
import { useWishlist } from '../../context/WishlistContext';

export function Wishlist() {
  const { items, loading } = useWishlist();

  if (loading) return <LoadingSpinner fullscreen label="Loading wishlist..." />;

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="h2 fw-bold mb-4">My Wishlist</h1>
      {items.length === 0 ? (
        <EmptyState
          title="No saved items"
          description="Tap the heart icon on products to save them here."
          action={
            <Link to="/shop" className="btn btn-primary btn-sm">
              Explore shop
            </Link>
          }
        />
      ) : (
        <div className="row g-4">
          {items.map((product) => (
            <div className="col-6 col-md-4 col-lg-3" key={product._id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
