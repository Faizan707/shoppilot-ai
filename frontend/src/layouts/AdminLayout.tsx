import {
  FiExternalLink,
  FiFolder,
  FiGrid,
  FiMenu,
  FiPackage,
  FiShoppingBag,
  FiShoppingCart,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Overview', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/categories', label: 'Categories', icon: FiFolder },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers },
];

const titles: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/products': 'Products',
  '/admin/products/new': 'Add product',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
};

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle =
    titles[location.pathname] ||
    (location.pathname.includes('/edit') ? 'Edit product' : 'Admin');

  return (
    <div className="admin-shell">
      <button
        type="button"
        className="admin-fab d-lg-none"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle admin menu"
      >
        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <FiShoppingBag size={18} />
          </div>
          <div>
            <div className="admin-brand-name">ShopPilot</div>
            <div className="admin-brand-sub">Operations</div>
          </div>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav-label">Manage</p>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-storefront-link">
            <FiExternalLink size={15} />
            View storefront
          </Link>
          <div className="admin-user-chip">
            <div className="admin-user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            <div className="min-w-0">
              <div className="admin-user-name text-truncate">{user?.name}</div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-overlay d-lg-none"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow mb-1">Control center</p>
            <h1 className="admin-topbar-title mb-0">{pageTitle}</h1>
          </div>
          <div className="admin-topbar-meta d-none d-md-flex">
            <span className="admin-live-dot" />
            Live store
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
