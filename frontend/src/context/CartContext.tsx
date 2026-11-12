import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import { queryKeys } from '../hooks/queryKeys';
import {
  addToCartApi,
  clearCartApi,
  fetchCart,
  removeCartItemApi,
  updateCartItemApi,
} from '../services/api';
import type { Cart, CartItem } from '../types';
import { getErrorMessage } from '../utils/errors';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: Cart | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: queryKeys.cart.root,
    queryFn: fetchCart,
    enabled: isAuthenticated,
  });

  const cart = cartQuery.data?.cart ?? null;
  const subtotal = cartQuery.data?.subtotal ?? 0;
  const itemCount = cartQuery.data?.itemCount ?? 0;

  const setCartData = useCallback(
    (data: { cart: Cart; subtotal: number; itemCount: number }) => {
      queryClient.setQueryData(queryKeys.cart.root, data);
    },
    [queryClient]
  );

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addToCartApi(productId, quantity),
    onSuccess: (data) => {
      setCartData(data);
      toast.success('Added to cart');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not add to cart')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItemApi(productId, quantity),
    onSuccess: setCartData,
    onError: (error) => toast.error(getErrorMessage(error, 'Could not update cart')),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeCartItemApi(productId),
    onSuccess: (data) => {
      setCartData(data);
      toast.info('Item removed');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not remove item')),
  });

  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: setCartData,
    onError: (error) => toast.error(getErrorMessage(error, 'Could not clear cart')),
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
  }, [queryClient]);

  const add = useCallback(
    async (productId: string, quantity = 1) => {
      await addMutation.mutateAsync({ productId, quantity });
    },
    [addMutation]
  );

  const update = useCallback(
    async (productId: string, quantity: number) => {
      await updateMutation.mutateAsync({ productId, quantity });
    },
    [updateMutation]
  );

  const remove = useCallback(
    async (productId: string) => {
      await removeMutation.mutateAsync(productId);
    },
    [removeMutation]
  );

  const clear = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      items: cart?.items ?? [],
      subtotal,
      itemCount,
      loading: cartQuery.isPending && isAuthenticated,
      refresh,
      add,
      update,
      remove,
      clear,
    }),
    [cart, subtotal, itemCount, cartQuery.isPending, isAuthenticated, refresh, add, update, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
