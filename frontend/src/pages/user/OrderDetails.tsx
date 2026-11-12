import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Price } from '../../components/Price';
import { queryKeys } from '../../hooks/queryKeys';
import { cancelOrder, fetchMyOrder } from '../../services/api';
import type { Order } from '../../types';
import { getErrorMessage } from '../../utils/errors';

const cancellable = new Set(['Pending', 'Confirmed']);

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => fetchMyOrder(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id!),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.orders.detail(id!), updated);
      toast.success('Order cancelled');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not cancel order'));
    },
  });

  const loading = orderQuery.isPending;
  const order = orderQuery.data;
  const error = orderQuery.isError ? 'Order not found.' : '';

  const handleCancel = () => {
    if (!order) return;
    cancelMutation.mutate();
  };

  if (loading) return <LoadingSpinner fullscreen label="Loading order..." />;
  if (error || !order) {
    return (
      <div className="container py-5">
        <EmptyState title="Order unavailable" description={error} />
      </div>
    );
  }

  return (
    <div className="container py-4 py-lg-5">
      <Link to="/orders" className="btn btn-link ps-0 mb-3">
        ← Back to orders
      </Link>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">{order.orderNumber}</h1>
          <p className="text-muted mb-0">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`badge status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h2 className="h5 fw-semibold mb-3">Items</h2>
            {order.items.map((item) => (
              <div key={`${item.product}-${item.name}`} className="d-flex gap-3 mb-3">
                <img src={item.image} alt={item.name} width={72} height={72} className="rounded-3 object-fit-cover" />
                <div className="flex-grow-1">
                  <div className="fw-semibold">{item.name}</div>
                  <OrderItemMeta qty={item.quantity} price={item.price} />
                </div>
              </div>
            ))}
          </div>
          <OrderStatusTimeline order={order} />
        </div>
        <OrderSummaryPanel order={order} onCancel={handleCancel} canCancel={cancellable.has(order.status)} />
      </div>
    </div>
  );
}

function OrderItemMeta({ qty, price }: { qty: number; price: number }) {
  return (
    <p className="text-muted small mb-0">
      Qty: {qty} · <Price amount={price} size="sm" />
    </p>
  );
}

function OrderStatusTimeline({ order }: { order: Order }) {
  return (
    <div className="card border-0 shadow-sm p-4">
      <h2 className="h5 fw-semibold mb-3">Status history</h2>
      <ul className="list-unstyled mb-0">
        {order.statusHistory.map((entry, idx) => (
          <li key={`${entry.status}-${idx}`} className="mb-2 small">
            <strong>{entry.status}</strong> — {new Date(entry.at).toLocaleString()}
            {entry.note && <span className="text-muted"> ({entry.note})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderSummaryPanel({
  order,
  onCancel,
  canCancel,
}: {
  order: Order;
  onCancel: () => void;
  canCancel: boolean;
}) {
  return (
    <div className="col-lg-4">
      <div className="card border-0 shadow-sm p-4 mb-3">
        <h2 className="h5 fw-semibold mb-3">Shipping</h2>
        <p className="small mb-1">{order.shippingAddress.fullName}</p>
        <p className="small mb-1">{order.shippingAddress.phone}</p>
        <p className="small mb-0 text-muted">
          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
          {order.shippingAddress.postalCode}, {order.shippingAddress.country}
        </p>
      </div>
      <div className="card border-0 shadow-sm p-4">
        <h2 className="h5 fw-semibold mb-3">Payment</h2>
        <p className="small mb-2">
          Method: <strong>{order.paymentMethod}</strong>
        </p>
        <div className="d-flex justify-content-between small mb-1">
          <span>Items</span>
          <Price amount={order.itemsPrice} size="sm" />
        </div>
        <div className="d-flex justify-content-between small mb-1">
          <span>Shipping</span>
          <Price amount={order.shippingPrice} size="sm" />
        </div>
        <div className="d-flex justify-content-between small mb-3">
          <span>Tax</span>
          <Price amount={order.taxPrice} size="sm" />
        </div>
        <div className="d-flex justify-content-between fw-bold border-top pt-2 mb-3">
          <span>Total</span>
          <Price amount={order.totalPrice} />
        </div>
        {canCancel && (
          <button type="button" className="btn btn-outline-danger w-100" onClick={() => void onCancel()}>
            Cancel order
          </button>
        )}
      </div>
    </div>
  );
}
