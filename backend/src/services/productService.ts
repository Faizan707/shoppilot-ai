import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slugify.js';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  includeInactive?: boolean;
}

export async function listProducts(query: ProductQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (!query.includeInactive) filter.isActive = true;

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.category) {
    if (!mongoose.isValidObjectId(query.category)) {
      throw new ApiError(400, 'Invalid category id');
    }
    filter.category = query.category;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {
      ...(query.minPrice !== undefined ? { $gte: Number(query.minPrice) } : {}),
      ...(query.maxPrice !== undefined ? { $lte: Number(query.maxPrice) } : {}),
    };
  }

  if (query.featured) filter.isFeatured = true;

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  switch (query.sort) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'popular':
      sort = { sold: -1, rating: -1 };
      break;
    case 'rating':
      sort = { rating: -1 };
      break;
    case 'newest':
    default:
      sort = { createdAt: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getProductByIdOrSlug(idOrSlug: string) {
  const filter = mongoose.isValidObjectId(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    : { slug: idOrSlug };

  const product = await Product.findOne(filter).populate('category', 'name slug');
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
}

export async function getProductByIdAdmin(id: string) {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  images: string[];
  stock: number;
  brand?: string;
  tags?: string[];
  isFeatured?: boolean;
}) {
  return Product.create({
    ...data,
    slug: uniqueSlug(data.name),
    tags: data.tags || [],
  });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    compareAtPrice: number;
    category: string;
    images: string[];
    stock: number;
    brand: string;
    tags: string[];
    isFeatured: boolean;
    isActive: boolean;
  }>
) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');

  Object.assign(product, data);
  if (data.name) product.slug = uniqueSlug(data.name);

  await product.save();
  return product.populate('category', 'name slug');
}

export async function deleteProduct(id: string) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, 'Product not found');
  await Review.deleteMany({ product: id });
  return product;
}

export async function listProductReviews(productId: string) {
  return Review.find({ product: productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
}

export async function createReview(
  productId: string,
  userId: string,
  data: { rating: number; comment: string }
) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  const existing = await Review.findOne({ product: productId, user: userId });
  if (existing) throw new ApiError(409, 'You have already reviewed this product');

  const review = await Review.create({
    product: productId,
    user: userId,
    rating: data.rating,
    comment: data.comment,
  });

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  product.rating = Number(stats[0]?.avg?.toFixed(1) || 0);
  product.numReviews = stats[0]?.count || 0;
  await product.save();

  return review.populate('user', 'name');
}
