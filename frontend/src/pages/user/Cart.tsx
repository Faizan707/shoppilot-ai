import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Price } from '../../components/Price';
import { useCart } from '../../context/CartContext';

export function Cart() {
  const { items, subtotal, loading, update, remove } = useCart();

  if (loading) return <LoadingSpinner fullscreen label="Loading cart..." />;

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState
          title="Your cart is empty"
          description="Browse the shop and add items you love."
          action={
            <Link to="/shop" className="btn btn-primary btn-sm">
              Continue shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="h2 fw-bold mb-4">Shopping Cart</h1>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-3">
            {items.map((item) => (
              <article key={item.product._id} className="cart-item card border-0 shadow-sm p-3">
                <div className="row g-3 align-items-center">
                  <div className="col-4 col-md-3">
                    <img src={item.product.images[0]} alt={item.product.name} className="rounded-3 w-100" />
                  </div>
                  <div className="col-8 col-md-5">
                    <h2 className="h6 fw-semibold mb-1">
                      <Link to={`/shop/${item.product._id}`} className="text-decoration-none text-reset">
                        {item.product.name}
                      </Link>
                    </h2>
                    <Price amount={item.price} size="sm" />
                  </div>
                  <div className="col-md-2">
                    <div className="qty-control d-inline-flex align-items-center">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => void update(item.product._id, Math.max(1, item.quantity - 1))}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="mx-2 small fw-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => void update(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2 text-md-end">
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0"
                      onClick={() => void remove(item.product._id)}
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 summary-card">
            <h2 className="h5 fw-bold mb-3">Order Summary</h2>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Subtotal</span>
              <Price amount={subtotal} />
            </div>
            <p className="small text-muted">Shipping and tax calculated at checkout.</p>
            <Link to="/checkout" className="btn btn-primary w-100 mt-3">
              Proceed to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
