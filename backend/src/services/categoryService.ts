import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify, uniqueSlug } from '../utils/slugify.js';

export async function listCategories(includeInactive = false) {
  const filter = includeInactive ? {} : { isActive: true };
  return Category.find(filter).sort({ name: 1 });
}

export async function getCategoryById(id: string) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  image?: string;
}) {
  const existing = await Category.findOne({ name: data.name.trim() });
  if (existing) throw new ApiError(409, 'Category already exists');

  return Category.create({
    name: data.name.trim(),
    slug: uniqueSlug(data.name),
    description: data.description,
    image: data.image,
  });
}

export async function updateCategory(
  id: string,
  data: { name?: string; description?: string; image?: string; isActive?: boolean }
) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, 'Category not found');

  if (data.name && data.name.trim() !== category.name) {
    const conflict = await Category.findOne({ name: data.name.trim(), _id: { $ne: id } });
    if (conflict) throw new ApiError(409, 'Category name already exists');
    category.name = data.name.trim();
    category.slug = slugify(data.name);
  }

  if (data.description !== undefined) category.description = data.description;
  if (data.image !== undefined) category.image = data.image;
  if (data.isActive !== undefined) category.isActive = data.isActive;

  await category.save();
  return category;
}

export async function deleteCategory(id: string) {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
}
