import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { Price } from '../../components/Price';
import { queryKeys } from '../../hooks/queryKeys';
import { fetchAdminOrder, fetchAdminOrders, updateAdminOrderStatus } from '../../services/api';
import type { Order, OrderStatus, PaginationMeta } from '../../types';
import { getErrorMessage } from '../../utils/errors';

const statuses: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];


export function ManageOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<OrderStatus>('Pending');
  const [note, setNote] = useState('');

  const orderId = searchParams.get('order') ?? '';
  const listKey = queryKeys.admin.orders(page, statusFilter, '');

  const ordersQuery = useQuery({
    queryKey: listKey,
    queryFn: () => fetchAdminOrders(page, 15, statusFilter || undefined),
  });

  const orderDetailQuery = useQuery({
    queryKey: queryKeys.admin.order(orderId),
    queryFn: () => fetchAdminOrder(orderId),
    enabled: !!orderId,
  });

  const selected = orderDetailQuery.data;
  const detailLoading = orderDetailQuery.isPending && !!orderId;

  useEffect(() => {
    if (orderDetailQuery.data) {
      setStatusUpdate(orderDetailQuery.data.status);
      setNote('');
    }
  }, [orderDetailQuery.data]);

  useEffect(() => {
    if (orderDetailQuery.isError && orderId) {
      toast.error(getErrorMessage(orderDetailQuery.error, 'Could not load order'));
    }
  }, [orderDetailQuery.isError, orderDetailQuery.error, orderId]);

  const statusMutation = useMutation({
    mutationFn: () => updateAdminOrderStatus(selected!._id, statusUpdate, note || undefined),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.admin.order(updated._id), updated);
      queryClient.setQueryData<{ items: Order[]; meta: PaginationMeta }>(listKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((o) => (o._id === updated._id ? updated : o)),
        };
      });
      setStatusUpdate(updated.status);
      toast.success('Order status updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Update failed'));
    },
  });

  const loading = ordersQuery.isPending;
  const orders = ordersQuery.data?.items ?? [];
  const meta = ordersQuery.data?.meta;

  const handleStatus = () => {
    if (!selected) return;
    statusMutation.mutate();
  };

  return (
    <div className="admin-page">
      <div className="row g-4">
        <div className={orderId ? 'col-lg-7' : 'col-12'}>
          <div className="d-flex gap-2 mb-3">
            <select
              className="form-select w-auto"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {loading && <LoadingSpinner label="Loading orders..." />}
          {!loading && orders.length === 0 && <EmptyState title="No orders" />}
          {!loading && orders.length > 0 && (
            <div className="table-responsive card border-0 shadow-sm">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className={orderId === order._id ? 'table-active' : ''}>
                      <td>{order.orderNumber}</td>
                      <td className="small">
                        {typeof order.user === 'object' ? (
                          <>
                            {order.user.name}
                            <div className="text-muted">{order.user.email}</div>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <Price amount={order.totalPrice} size="sm" />
                      </td>
                      <td>{order.status}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSearchParams({ order: order._id })}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </div>

        {orderId && (
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 sticky-top admin-order-panel">
              {detailLoading || !selected ? (
                <LoadingSpinner label="Loading details..." />
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h2 className="h5 fw-bold mb-0">{selected.orderNumber}</h2>
                      <p className="text-muted small mb-0">{new Date(selected.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setSearchParams({})}
                    />
                  </div>
                  <ul className="list-unstyled small mb-3">
                    {selected.items.map((item) => (
                      <li key={`${item.product}-${item.name}`} className="mb-2 d-flex justify-content-between">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <Price amount={item.price * item.quantity} size="sm" />
                      </li>
                    ))}
                  </ul>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="order-status">
                      Update status
                    </label>
                    <select
                      id="order-status"
                      className="form-select"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value as OrderStatus)}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="order-note">
                      Note (optional)
                    </label>
                    <input
                      id="order-note"
                      className="form-control"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <button type="button" className="btn btn-primary w-100" onClick={() => void handleStatus()}>
                    Save status
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
