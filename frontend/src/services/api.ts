import axios, { type AxiosRequestConfig } from 'axios';
import type {
  ApiSuccessResponse,
  Cart,
  Category,
  DashboardStats,
  Order,
  PaginationMeta,
  Product,
  ProductQueryParams,
  Review,
  ShippingAddress,
  User,
  Wishlist,
} from '../types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data;
}

function unwrapPaginated<T>(response: {
  data: ApiSuccessResponse<T[]>;
}): { items: T[]; meta: PaginationMeta } {
  const { data, meta } = response.data;
  if (!meta) {
    throw new Error('Missing pagination metadata');
  }
  return { items: data, meta };
}

// Auth
export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<User> {
  const res = await api.post<ApiSuccessResponse<{ user: User }>>('/auth/register', payload);
  return unwrap(res).user;
}

export async function loginUser(payload: { email: string; password: string }): Promise<User> {
  const res = await api.post<ApiSuccessResponse<{ user: User }>>('/auth/login', payload);
  return unwrap(res).user;
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout');
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await api.get<ApiSuccessResponse<{ user: User }>>('/auth/me');
  return unwrap(res).user;
}

export async function updateUserProfile(payload: Partial<User>): Promise<User> {
  const res = await api.put<ApiSuccessResponse<{ user: User }>>('/auth/profile', payload);
  return unwrap(res).user;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.put('/auth/password', payload);
}

// Products
export async function fetchProducts(params?: ProductQueryParams) {
  const res = await api.get<ApiSuccessResponse<Product[]>>('/products', { params });
  return unwrapPaginated<Product>(res);
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await api.get<ApiSuccessResponse<{ product: Product }>>(`/products/${id}`);
  return unwrap(res).product;
}

export async function fetchAdminProduct(id: string): Promise<Product> {
  const res = await api.get<ApiSuccessResponse<{ product: Product }>>(`/admin/products/${id}`);
  return unwrap(res).product;
}

export async function uploadProductImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));
  const res = await api.post<ApiSuccessResponse<{ urls: string[] }>>('/upload/images', form, {
    // Let the browser set multipart boundary
    headers: { 'Content-Type': undefined },
  });
  return unwrap(res).urls;
}

export async function createProduct(payload: Record<string, unknown>): Promise<Product> {
  const res = await api.post<ApiSuccessResponse<{ product: Product }>>('/products', payload);
  return unwrap(res).product;
}

export async function updateProduct(id: string, payload: Record<string, unknown>): Promise<Product> {
  const res = await api.put<ApiSuccessResponse<{ product: Product }>>(`/products/${id}`, payload);
  return unwrap(res).product;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const res = await api.get<ApiSuccessResponse<{ reviews: Review[] }>>(`/products/${productId}/reviews`);
  return unwrap(res).reviews;
}

export async function addProductReview(
  productId: string,
  payload: { rating: number; comment: string }
): Promise<Review> {
  const res = await api.post<ApiSuccessResponse<{ review: Review }>>(`/products/${productId}/reviews`, payload);
  return unwrap(res).review;
}

// Categories
export async function fetchCategories(all = false): Promise<Category[]> {
  const res = await api.get<ApiSuccessResponse<{ categories: Category[] }>>('/categories', {
    params: all ? { all: 'true' } : undefined,
  });
  return unwrap(res).categories;
}

export async function createCategory(payload: { name: string; description?: string; image?: string }) {
  const res = await api.post<ApiSuccessResponse<{ category: Category }>>('/categories', payload);
  return unwrap(res).category;
}

export async function updateCategory(id: string, payload: Record<string, unknown>) {
  const res = await api.put<ApiSuccessResponse<{ category: Category }>>(`/categories/${id}`, payload);
  return unwrap(res).category;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

// Cart
export async function fetchCart(): Promise<{ cart: Cart; subtotal: number; itemCount: number }> {
  const res = await api.get<ApiSuccessResponse<{ cart: Cart; subtotal: number; itemCount: number }>>('/cart');
  return unwrap(res);
}

export async function addToCartApi(productId: string, quantity = 1) {
  const res = await api.post<ApiSuccessResponse<{ cart: Cart; subtotal: number; itemCount: number }>>('/cart', {
    productId,
    quantity,
  });
  return unwrap(res);
}

export async function updateCartItemApi(productId: string, quantity: number) {
  const res = await api.put<ApiSuccessResponse<{ cart: Cart; subtotal: number; itemCount: number }>>(
    `/cart/${productId}`,
    { quantity }
  );
  return unwrap(res);
}

export async function removeCartItemApi(productId: string) {
  const res = await api.delete<ApiSuccessResponse<{ cart: Cart; subtotal: number; itemCount: number }>>(
    `/cart/${productId}`
  );
  return unwrap(res);
}

export async function clearCartApi() {
  const res = await api.delete<ApiSuccessResponse<{ cart: Cart; subtotal: number; itemCount: number }>>('/cart');
  return unwrap(res);
}

// Wishlist
export async function fetchWishlist(): Promise<Wishlist> {
  const res = await api.get<ApiSuccessResponse<{ wishlist: Wishlist }>>('/wishlist');
  return unwrap(res).wishlist;
}

export async function addToWishlistApi(productId: string): Promise<Wishlist> {
  const res = await api.post<ApiSuccessResponse<{ wishlist: Wishlist }>>('/wishlist', { productId });
  return unwrap(res).wishlist;
}

export async function removeFromWishlistApi(productId: string): Promise<Wishlist> {
  const res = await api.delete<ApiSuccessResponse<{ wishlist: Wishlist }>>(`/wishlist/${productId}`);
  return unwrap(res).wishlist;
}

// Orders
export async function createOrder(shippingAddress: ShippingAddress): Promise<Order> {
  const res = await api.post<ApiSuccessResponse<{ order: Order }>>('/orders', { shippingAddress });
  return unwrap(res).order;
}

export async function fetchMyOrders(page = 1, limit = 10) {
  const res = await api.get<ApiSuccessResponse<Order[]>>('/orders', { params: { page, limit } });
  return unwrapPaginated<Order>(res);
}

export async function fetchMyOrder(id: string): Promise<Order> {
  const res = await api.get<ApiSuccessResponse<{ order: Order }>>(`/orders/${id}`);
  return unwrap(res).order;
}

export async function cancelOrder(id: string): Promise<Order> {
  const res = await api.put<ApiSuccessResponse<{ order: Order }>>(`/orders/${id}/cancel`);
  return unwrap(res).order;
}

// Admin
export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await api.get<ApiSuccessResponse<DashboardStats>>('/admin/dashboard');
  return unwrap(res);
}

export async function fetchCustomers(page = 1, limit = 20, search?: string) {
  const res = await api.get<ApiSuccessResponse<User[]>>('/admin/customers', { params: { page, limit, search } });
  return unwrapPaginated<User>(res);
}

export async function toggleCustomerActive(id: string, isActive: boolean) {
  const res = await api.put<ApiSuccessResponse<{ customer: User }>>(`/admin/customers/${id}`, { isActive });
  return unwrap(res).customer;
}

export async function fetchAdminOrders(page = 1, limit = 20, status?: string, search?: string) {
  const res = await api.get<ApiSuccessResponse<Order[]>>('/admin/orders', {
    params: { page, limit, status, search },
  });
  return unwrapPaginated<Order>(res);
}

export async function fetchAdminOrder(id: string): Promise<Order> {
  const res = await api.get<ApiSuccessResponse<{ order: Order }>>(`/admin/orders/${id}`);
  return unwrap(res).order;
}

export async function updateAdminOrderStatus(id: string, status: string, note?: string) {
  const res = await api.put<ApiSuccessResponse<{ order: Order }>>(`/admin/orders/${id}/status`, {
    status,
    note,
  });
  return unwrap(res).order;
}

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await api.request<ApiSuccessResponse<T>>(config);
  return unwrap(res);
}
