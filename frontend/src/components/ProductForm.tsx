import { FormEvent, useEffect, useState } from 'react';
import type { Category, Product } from '../types';

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  images: string[];
  stock: number;
  brand?: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
}

interface ProductFormProps {
  initial?: Partial<Product>;
  categories: Category[];
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

const defaults: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  category: '',
  images: [''],
  stock: 0,
  brand: '',
  tags: [],
  isFeatured: false,
  isActive: true,
};

export function ProductForm({ initial, categories, submitLabel, onSubmit }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(defaults);
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initial) return;
    const categoryId = typeof initial.category === 'object' ? initial.category._id : initial.category ?? '';
    setValues({
      name: initial.name ?? '',
      description: initial.description ?? '',
      price: initial.price ?? 0,
      compareAtPrice: initial.compareAtPrice,
      category: categoryId,
      images: initial.images?.length ? initial.images : [''],
      stock: initial.stock ?? 0,
      brand: initial.brand ?? '',
      tags: initial.tags ?? [],
      isFeatured: initial.isFeatured ?? false,
      isActive: initial.isActive ?? true,
    });
    setTagsInput((initial.tags ?? []).join(', '));
  }, [initial]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        images: values.images.map((s) => s.trim()).filter(Boolean),
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card border-0 shadow-sm p-4" onSubmit={(e) => void handleSubmit(e)}>
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label" htmlFor="p-name">
            Name
          </label>
          <input
            id="p-name"
            className="form-control"
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="p-brand">
            Brand
          </label>
          <input
            id="p-brand"
            className="form-control"
            value={values.brand ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, brand: e.target.value }))}
          />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="p-desc">
            Description
          </label>
          <textarea
            id="p-desc"
            className="form-control"
            rows={5}
            required
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="p-price">
            Price (PKR)
          </label>
          <input
            id="p-price"
            type="number"
            min={0}
            className="form-control"
            required
            value={values.price}
            onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="p-compare">
            Compare at price
          </label>
          <input
            id="p-compare"
            type="number"
            min={0}
            className="form-control"
            value={values.compareAtPrice ?? ''}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="p-stock">
            Stock
          </label>
          <input
            id="p-stock"
            type="number"
            min={0}
            className="form-control"
            required
            value={values.stock}
            onChange={(e) => setValues((v) => ({ ...v, stock: Number(e.target.value) }))}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="p-category">
            Category
          </label>
          <select
            id="p-category"
            className="form-select"
            required
            value={values.category}
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="p-tags">
            Tags (comma separated)
          </label>
          <input id="p-tags" className="form-control" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Image URLs</label>
          {values.images.map((img, idx) => (
            <div className="input-group mb-2" key={`img-${idx}`}>
              <input
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={img}
                onChange={(e) =>
                  setValues((v) => {
                    const next = [...v.images];
                    next[idx] = e.target.value;
                    return { ...v, images: next };
                  })
                }
              />
              {values.images.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() =>
                    setValues((v) => ({ ...v, images: v.images.filter((_, i) => i !== idx) }))
                  }
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setValues((v) => ({ ...v, images: [...v.images, ''] }))}
          >
            Add image URL
          </button>
        </div>
        <div className="col-12 d-flex flex-wrap gap-4">
          <label className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={values.isFeatured}
              onChange={(e) => setValues((v) => ({ ...v, isFeatured: e.target.checked }))}
            />
            <span className="form-check-label">Featured product</span>
          </label>
          <label className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={values.isActive}
              onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
            />
            <span className="form-check-label">Active (visible in shop)</span>
          </label>
        </div>
      </div>
      <button type="submit" className="btn btn-primary mt-4" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
