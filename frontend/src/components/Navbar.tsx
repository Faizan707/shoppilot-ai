import {
  FiHeart,
  FiLayout,
  FiLogOut,
  FiMenu,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export function Navbar() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link px-3 ${isActive ? 'active' : ''}`;

  return (
    <header className="navbar-wrapper sticky-top">
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold brand-text">
            <span className="navbar-logo-mark">
              <FiShoppingBag size={16} />
            </span>
            ShopPilot AI
          </Link>
          <button
            type="button"
            className="navbar-toggler border-0"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className={navLinkClass} end onClick={() => setOpen(false)}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/shop" className={navLinkClass} onClick={() => setOpen(false)}>
                  Shop
                </NavLink>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link to="/cart" className="nav-link icon-link" onClick={() => setOpen(false)}>
                      <FiShoppingCart size={20} />
                      <span className="ms-1">Cart</span>
                      {itemCount > 0 && <span className="badge rounded-pill bg-primary ms-1">{itemCount}</span>}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/wishlist" className="nav-link icon-link" onClick={() => setOpen(false)}>
                      <FiHeart size={20} />
                      <span className="ms-1">Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="badge rounded-pill bg-primary ms-1">{wishlistCount}</span>
                      )}
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <button
                      className="nav-link btn btn-link dropdown-toggle d-flex align-items-center gap-1"
                      data-bs-toggle="dropdown"
                      type="button"
                    >
                      <FiUser size={18} />
                      {user?.name.split(' ')[0]}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                      <li>
                        <Link className="dropdown-item" to="/profile" onClick={() => setOpen(false)}>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/orders" onClick={() => setOpen(false)}>
                          My Orders
                        </Link>
                      </li>
                      {isAdmin && (
                        <li>
                          <Link className="dropdown-item" to="/admin" onClick={() => setOpen(false)}>
                            <FiLayout size={16} className="me-2" />
                            Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button type="button" className="dropdown-item text-danger" onClick={() => void handleLogout()}>
                          <FiLogOut size={16} className="me-2" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="btn btn-outline-primary btn-sm me-lg-2" onClick={() => setOpen(false)}>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item mt-2 mt-lg-0">
                    <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
