import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await cart.populate({
    path: 'items.product',
    select: 'name slug price images stock isActive',
  });

  const items = cart.items.filter((item) => item.product);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { cart: { ...cart.toObject(), items }, subtotal, itemCount: items.reduce((n, i) => n + i.quantity, 0) };
}

export async function addToCart(userId: string, productId: string, quantity = 1) {
  if (quantity < 1) throw new ApiError(400, 'Quantity must be at least 1');

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  if (product.stock < quantity) throw new ApiError(400, 'Insufficient stock');

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.product.toString() === productId);

  if (existing) {
    const nextQty = existing.quantity + quantity;
    if (product.stock < nextQty) throw new ApiError(400, 'Insufficient stock');
    existing.quantity = nextQty;
    existing.price = product.price;
  } else {
    cart.items.push({ product: product._id, quantity, price: product.price });
  }

  await cart.save();
  return getCart(userId);
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  if (quantity < 1) throw new ApiError(400, 'Quantity must be at least 1');

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  if (product.stock < quantity) throw new ApiError(400, 'Insufficient stock');

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ApiError(404, 'Item not found in cart');

  item.quantity = quantity;
  item.price = product.price;
  await cart.save();
  return getCart(userId);
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return getCart(userId);
}
