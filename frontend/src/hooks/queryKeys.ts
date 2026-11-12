import type { ProductQueryParams } from '../types';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params?: ProductQueryParams) => ['products', 'list', params ?? {}] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    reviews: (id: string) => ['products', 'reviews', id] as const,
  },
  categories: {
    all: (includeAll = false) => ['categories', { all: includeAll }] as const,
  },
  cart: {
    root: ['cart'] as const,
  },
  wishlist: {
    root: ['wishlist'] as const,
  },
  orders: {
    mine: (page = 1) => ['orders', 'mine', page] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    products: (params?: ProductQueryParams) => ['admin', 'products', params ?? {}] as const,
    product: (id: string) => ['admin', 'product', id] as const,
    categories: ['admin', 'categories'] as const,
    orders: (page = 1, status = '', search = '') =>
      ['admin', 'orders', { page, status, search }] as const,
    order: (id: string) => ['admin', 'order', id] as const,
    customers: (page = 1, search = '') => ['admin', 'customers', { page, search }] as const,
  },
};
