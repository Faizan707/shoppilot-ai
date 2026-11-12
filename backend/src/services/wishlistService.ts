import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

async function getOrCreateWishlist(userId: string) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
}

export async function getWishlist(userId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  await wishlist.populate({
    path: 'products',
    select: 'name slug price images rating stock isActive',
    match: { isActive: true },
  });
  return wishlist;
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  const wishlist = await getOrCreateWishlist(userId);
  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }

  return getWishlist(userId);
}

export async function removeFromWishlist(userId: string, productId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  await wishlist.save();
  return getWishlist(userId);
}
