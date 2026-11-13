import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from '../../lib/toast';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Price } from '../../components/Price';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { queryKeys } from '../../hooks/queryKeys';
import { addProductReview, fetchProduct, fetchProductReviews } from '../../services/api';
import type { Product } from '../../types';
import { getErrorMessage } from '../../utils/errors';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { add } = useCart();
  const { add: addWishlist, remove: removeWishlist, isInWishlist } = useWishlist();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const productQuery = useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  const reviewsQuery = useQuery({
    queryKey: queryKeys.products.reviews(id ?? ''),
    queryFn: () => fetchProductReviews(id!),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment: string }) => addProductReview(id!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.reviews(id!) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id!) });
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not submit review'));
    },
  });

  const loading = productQuery.isPending || reviewsQuery.isPending;
  const product = productQuery.data;
  const reviews = reviewsQuery.data ?? [];
  const error = productQuery.isError ? 'Product not found or unavailable.' : '';

  if (loading) return <LoadingSpinner fullscreen label="Loading product..." />;
  if (error || !product) {
    return (
      <div className="container py-5">
        <EmptyState
          title="Product not found"
          description={error}
          action={
            <Link to="/shop" className="btn btn-primary btn-sm">
              Back to shop
            </Link>
          }
        />
      </div>
    );
  }

  const categoryName = typeof product.category === 'object' ? product.category.name : '';
  const inWishlist = isInWishlist(product._id);

  const handleReview = (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    reviewMutation.mutate(reviewForm);
  };

  return (
    <div className="container py-4 py-lg-5">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/shop">Shop</Link>
          </li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4 g-lg-5">
        <div className="col-lg-6">
          <ActivityGallery product={product} activeImage={activeImage} onSelect={setActiveImage} />
        </div>
        <div className="col-lg-6">
          {categoryName && <span className="badge text-bg-light mb-2">{categoryName}</span>}
          <h1 className="h2 fw-bold">{product.name}</h1>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaStar size={18} className="text-warning" />
            <span className="fw-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-muted small">({product.numReviews} reviews)</span>
          </div>
          <Price amount={product.price} compareAt={product.compareAtPrice} size="lg" />
          <p className="text-muted mt-3">{product.description}</p>
          <p className="small mb-4">
            <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
          </p>

          <QuantityControl
            quantity={quantity}
            stock={product.stock}
            onDec={() => setQuantity((q) => Math.max(1, q - 1))}
            onInc={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            onChange={setQuantity}
          />

          <div className="d-flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!isAuthenticated || product.stock === 0}
              onClick={() => void add(product._id, quantity)}
            >
              <FiShoppingCart size={18} className="me-2" />
              Add to cart
            </button>
            {isAuthenticated && (
              <button
                type="button"
                className={`btn btn-outline-primary ${inWishlist ? 'active' : ''}`}
                onClick={() => void (inWishlist ? removeWishlist(product._id) : addWishlist(product._id))}
              >
                {inWishlist ? (
                  <FaHeart size={18} className="me-2" />
                ) : (
                  <FaRegHeart size={18} className="me-2" />
                )}
                {inWishlist ? 'In wishlist' : 'Add to wishlist'}
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="h4 fw-bold mb-3">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet. Be the first to share your experience.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reviews.map((review) => (
              <article key={review._id} className="review-card p-3">
                <div className="d-flex justify-content-between">
                  <strong>{typeof review.user === 'object' ? review.user.name : 'Customer'}</strong>
                  <span className="text-muted small">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-warning small mb-1">{'★'.repeat(review.rating)}</div>
                <p className="mb-0">{review.comment}</p>
              </article>
            ))}
          </div>
        )}

        {isAuthenticated && (
          <form className="card border-0 shadow-sm p-4 mt-4" onSubmit={(e) => void handleReview(e)}>
            <h3 className="h6 fw-semibold mb-3">Write a review</h3>
            <div className="mb-3">
              <label className="form-label" htmlFor="rating">
                Rating
              </label>
              <select
                id="rating"
                className="form-select w-auto"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} stars
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="comment">
                Comment
              </label>
              <textarea
                id="comment"
                className="form-control"
                rows={4}
                required
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? 'Submitting...' : 'Submit review'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function ActivityGallery({
  product,
  activeImage,
  onSelect,
}: {
  product: Product;
  activeImage: number;
  onSelect: (i: number) => void;
}) {
  return (
    <>
      <div className="product-detail-main mb-3">
        <img src={product.images[activeImage]} alt={product.name} className="w-100 rounded-4" />
      </div>
      <div className="d-flex gap-2 flex-wrap">
        {product.images.map((img, idx) => (
          <button
            key={img}
            type="button"
            className={`thumb-btn ${idx === activeImage ? 'active' : ''}`}
            onClick={() => onSelect(idx)}
          >
            <img src={img} alt="" />
          </button>
        ))}
      </div>
    </>
  );
}

function QuantityControl({
  quantity,
  stock,
  onDec,
  onInc,
  onChange,
}: {
  quantity: number;
  stock: number;
  onDec: () => void;
  onInc: () => void;
  onChange: (n: number) => void;
}) {
  return (
    <div className="qty-control d-inline-flex align-items-center">
      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onDec} disabled={quantity <= 1}>
        <FiMinus size={16} />
      </button>
      <input
        type="number"
        className="form-control form-control-sm text-center mx-2 qty-input"
        min={1}
        max={stock}
        value={quantity}
        onChange={(e) => onChange(Math.min(stock, Math.max(1, Number(e.target.value) || 1)))}
      />
      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onInc} disabled={quantity >= stock}>
        <FiPlus size={16} />
      </button>
    </div>
  );
}
