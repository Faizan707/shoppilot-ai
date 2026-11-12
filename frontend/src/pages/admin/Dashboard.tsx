import { useQuery } from '@tanstack/react-query';
import { FiArrowUpRight, FiPackage, FiShoppingBag, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Price } from '../../components/Price';
import { queryKeys } from '../../hooks/queryKeys';
import { fetchDashboard } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

export function Dashboard() {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: fetchDashboard,
  });

  if (dashboardQuery.isPending) return <LoadingSpinner fullscreen label="Loading dashboard..." />;
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <EmptyState title="Dashboard unavailable" description="Failed to load dashboard." />;
  }

  const stats = dashboardQuery.data;
  const maxRevenue = Math.max(...stats.salesOverview.map((d) => d.revenue), 1);
  const weekRevenue = stats.salesOverview.reduce((sum, d) => sum + d.revenue, 0);

  const kpis = [
    {
      label: 'Total revenue',
      value: formatPrice(stats.totalRevenue),
      hint: 'All completed sales',
      icon: FiTrendingUp,
      tone: 'teal',
    },
    {
      label: 'Orders',
      value: stats.totalOrders.toLocaleString(),
      hint: 'Excluding cancelled',
      icon: FiShoppingBag,
      tone: 'sky',
    },
    {
      label: 'Customers',
      value: stats.totalCustomers.toLocaleString(),
      hint: 'Registered buyers',
      icon: FiUsers,
      tone: 'amber',
    },
    {
      label: 'Products',
      value: stats.totalProducts.toLocaleString(),
      hint: 'Catalog size',
      icon: FiPackage,
      tone: 'slate',
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-welcome mb-4">
        <div>
          <h2 className="admin-section-title mb-1">Business snapshot</h2>
          <p className="admin-section-copy mb-0">
            Track revenue, fulfillment, and catalog health in one place.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/products/new" className="btn btn-admin-primary">
            Add product
          </Link>
          <Link to="/admin/orders" className="btn btn-admin-ghost">
            Manage orders
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <div className="col-6 col-xl-3" key={card.label}>
              <article className={`kpi-card kpi-${card.tone}`}>
                <div className="kpi-icon">
                  <Icon size={18} />
                </div>
                <div className="kpi-label">{card.label}</div>
                <div className="kpi-value">{card.value}</div>
                <div className="kpi-hint">{card.hint}</div>
              </article>
            </div>
          );
        })}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <section className="admin-panel h-100">
            <div className="admin-panel-head">
              <div>
                <h3 className="admin-panel-title mb-1">Sales overview</h3>
                <p className="admin-panel-sub mb-0">Last 7 days</p>
              </div>
              <div className="admin-panel-stat">
                <span className="small text-muted">Week total</span>
                <strong>{formatPrice(weekRevenue)}</strong>
              </div>
            </div>

            {stats.salesOverview.length === 0 ? (
              <p className="text-muted small mb-0 px-1">No sales data yet. Orders will appear here.</p>
            ) : (
              <div className="sales-chart">
                {stats.salesOverview.map((day) => {
                  const height = Math.max(12, (day.revenue / maxRevenue) * 140);
                  return (
                    <div key={day.date} className="chart-col">
                      <div className="chart-value">{formatCompact(day.revenue)}</div>
                      <div
                        className="chart-bar"
                        style={{ height: `${height}px` }}
                        title={`${day.date}: ${formatPrice(day.revenue)} · ${day.orders} orders`}
                      />
                      <div className="chart-label">{formatDay(day.date)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="col-lg-5">
          <section className="admin-panel h-100">
            <div className="admin-panel-head">
              <div>
                <h3 className="admin-panel-title mb-1">Recent orders</h3>
                <p className="admin-panel-sub mb-0">Latest store activity</p>
              </div>
              <Link to="/admin/orders" className="admin-text-link">
                View all
                <FiArrowUpRight size={14} />
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <p className="text-muted small mb-0">No orders yet.</p>
            ) : (
              <div className="admin-order-list">
                {stats.recentOrders.map((order) => (
                  <Link
                    key={order._id}
                    to={`/admin/orders?order=${order._id}`}
                    className="admin-order-row"
                  >
                    <div className="min-w-0">
                      <div className="admin-order-id text-truncate">{order.orderNumber}</div>
                      <div className="admin-order-meta text-truncate">
                        {typeof order.user === 'object' && order.user
                          ? order.user.name
                          : 'Customer'}{' '}
                        · {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold">
                        <Price amount={order.totalPrice} size="sm" />
                      </div>
                      <span className={`badge status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function formatDay(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function formatCompact(amount: number) {
  if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
  return String(Math.round(amount));
}
