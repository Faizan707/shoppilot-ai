import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { Price } from '../../components/Price';
import { queryKeys } from '../../hooks/queryKeys';
import { fetchMyOrders } from '../../services/api';

export function MyOrders() {
  const [page, setPage] = useState(1);

  const ordersQuery = useQuery({
    queryKey: queryKeys.orders.mine(page),
    queryFn: () => fetchMyOrders(page, 10),
  });

  const loading = ordersQuery.isPending;
  const orders = ordersQuery.data?.items ?? [];
  const meta = ordersQuery.data?.meta;

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="h2 fw-bold mb-4">My Orders</h1>
      {loading && <LoadingSpinner label="Loading orders..." />}
      {!loading && orders.length === 0 && (
        <EmptyState title="No orders yet" description="Your purchases will appear here." />
      )}
      {!loading && orders.length > 0 && (
        <div className="table-responsive card border-0 shadow-sm">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="fw-semibold">{order.orderNumber}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>
                    <Price amount={order.totalPrice} size="sm" />
                  </td>
                  <td className="text-end">
                    <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {meta && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  );
}
