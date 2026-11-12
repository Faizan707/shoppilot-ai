import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import { queryKeys } from '../hooks/queryKeys';
import { addToWishlistApi, fetchWishlist, removeFromWishlistApi } from '../services/api';
import type { Product } from '../types';
import { getErrorMessage } from '../utils/errors';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
  items: Product[];
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: queryKeys.wishlist.root,
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
    select: (wishlist) => wishlist.products.filter(Boolean),
  });

  const items = wishlistQuery.data ?? [];

  const addMutation = useMutation({
    mutationFn: addToWishlistApi,
    onSuccess: (wishlist) => {
      queryClient.setQueryData(queryKeys.wishlist.root, wishlist);
      toast.success('Added to wishlist');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not add to wishlist')),
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlistApi,
    onSuccess: (wishlist) => {
      queryClient.setQueryData(queryKeys.wishlist.root, wishlist);
      toast.info('Removed from wishlist');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not remove from wishlist')),
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.root });
  }, [queryClient]);

  const add = useCallback(
    async (productId: string) => {
      await addMutation.mutateAsync(productId);
    },
    [addMutation]
  );

  const remove = useCallback(
    async (productId: string) => {
      await removeMutation.mutateAsync(productId);
    },
    [removeMutation]
  );

  const isInWishlist = useCallback(
    (productId: string) => items.some((p) => p._id === productId),
    [items]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      loading: wishlistQuery.isPending && isAuthenticated,
      refresh,
      add,
      remove,
      isInWishlist,
    }),
    [items, wishlistQuery.isPending, isAuthenticated, refresh, add, remove, isInWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
