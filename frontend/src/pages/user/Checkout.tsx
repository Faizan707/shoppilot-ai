import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '../../lib/toast';
import { Price } from '../../components/Price';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { queryKeys } from '../../hooks/queryKeys';
import { createOrder } from '../../services/api';
import type { ShippingAddress } from '../../types';
import { getErrorMessage } from '../../utils/errors';

const emptyAddress: ShippingAddress = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Pakistan',
};

export function Checkout() {
  const { user } = useAuth();
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState<ShippingAddress>({
    ...emptyAddress,
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    street: user?.address?.street ?? '',
    city: user?.address?.city ?? '',
    state: user?.address?.state ?? '',
    postalCode: user?.address?.postalCode ?? '',
    country: user?.address?.country ?? 'Pakistan',
  });
  const createOrderMutation = useMutation({
    mutationFn: (shippingAddress: ShippingAddress) => createOrder(shippingAddress),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully');
      navigate(`/orders/${order._id}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Checkout failed'));
    },
  });

  const shippingPrice = useMemo(() => (subtotal >= 5000 ? 0 : 250), [subtotal]);
  const taxPrice = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const totalPrice = subtotal + shippingPrice + taxPrice;

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/shop" className="btn btn-primary btn-sm">
          Go to shop
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate(address);
  };

  const field = (key: keyof ShippingAddress, label: string, required = true) => (
    <div className="mb-3">
      <label className="form-label" htmlFor={key}>
        {label}
      </label>
      <input
        id={key}
        className="form-control"
        required={required}
        value={address[key]}
        onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="h2 fw-bold mb-4">Checkout</h1>
      <div className="row g-4">
        <div className="col-lg-7">
          <form className="card border-0 shadow-sm p-4" onSubmit={(e) => void handleSubmit(e)}>
            <h2 className="h5 fw-semibold mb-3">Shipping address</h2>
            {field('fullName', 'Full name')}
            {field('phone', 'Phone')}
            {field('street', 'Street address')}
            <div className="row">
              <div className="col-md-6">{field('city', 'City')}</div>
              <div className="col-md-6">{field('state', 'State/Province')}</div>
            </div>
            <div className="row">
              <div className="col-md-6">{field('postalCode', 'Postal code')}</div>
              <div className="col-md-6">{field('country', 'Country')}</div>
            </div>
            <div className="alert alert-info small mb-4">
              Payment method: <strong>Cash on Delivery (COD)</strong>
            </div>
            <button type="submit" className="btn btn-primary" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? 'Placing order...' : 'Place order'}
            </button>
          </form>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="h5 fw-semibold mb-3">Order summary</h2>
            <ul className="list-unstyled mb-3">
              {items.map((item) => (
                <li key={item.product._id} className="d-flex justify-content-between small mb-2">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <Price amount={item.price * item.quantity} size="sm" />
                </li>
              ))}
            </ul>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Subtotal</span>
              <Price amount={subtotal} size="sm" />
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Shipping</span>
              <Price amount={shippingPrice} size="sm" />
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Tax (5%)</span>
              <Price amount={taxPrice} size="sm" />
            </div>
            <div className="d-flex justify-content-between fw-bold border-top pt-3">
              <span>Total</span>
              <Price amount={totalPrice} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
