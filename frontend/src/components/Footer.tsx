import { FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer mt-auto py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2 fw-bold mb-2">
              <span className="navbar-logo-mark">
                <FiShoppingBag size={16} />
              </span>
              ShopPilot AI
            </div>
            <p className="text-muted small mb-0">
              Your trusted destination for quality products across Pakistan with fast checkout and cash on
              delivery.
            </p>
          </div>
          <div className="col-6 col-md-3">
            <h6 className="fw-semibold">Quick Links</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-1">
                <Link to="/shop" className="footer-link">
                  Shop
                </Link>
              </li>
              <li className="mb-1">
                <Link to="/cart" className="footer-link">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="footer-link">
                  Orders
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <h6 className="fw-semibold">Support</h6>
            <p className="small text-muted mb-1">Email: support@shoppilot.ai</p>
            <p className="small text-muted mb-0">Phone: +92 300 1234567</p>
          </div>
        </div>
        <hr className="my-4" />
        <p className="small text-muted mb-0">© {new Date().getFullYear()} ShopPilot AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
