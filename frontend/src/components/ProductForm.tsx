import { FormEvent, useEffect, useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { toast } from '../lib/toast';
import { uploadProductImages } from '../services/api';
import type { Category, Product } from '../types';
import { getErrorMessage } from '../utils/errors';

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
  images: [],
  stock: 0,
  brand: '',
  tags: [],
  isFeatured: false,
  isActive: true,
};

function parseDigits(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

export function ProductForm({ initial, categories, submitLabel, onSubmit }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(defaults);
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initial) return;
    const categoryId = typeof initial.category === 'object' ? initial.category._id : initial.category ?? '';
    setValues({
      name: initial.name ?? '',
      description: initial.description ?? '',
      price: initial.price ?? 0,
      compareAtPrice: initial.compareAtPrice,
      category: categoryId,
      images: initial.images?.length ? initial.images : [],
      stock: initial.stock ?? 0,
      brand: initial.brand ?? '',
      tags: initial.tags ?? [],
      isFeatured: initial.isFeatured ?? false,
      isActive: initial.isActive ?? true,
    });
    setTagsInput((initial.tags ?? []).join(', '));
  }, [initial]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    setUploading(true);
    try {
      const urls = await uploadProductImages(files);
      setValues((v) => ({ ...v, images: [...v.images, ...urls] }));
      toast.success('Images uploaded', `${urls.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Upload failed', getErrorMessage(error, 'Could not upload images'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.images.length) {
      toast.error('Images required', 'Upload at least one product image');
      return;
    }
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control"
            required
            value={values.price === 0 ? '' : String(values.price)}
            placeholder="0"
            onChange={(e) => {
              const digits = parseDigits(e.target.value);
              setValues((v) => ({ ...v, price: digits === '' ? 0 : Number(digits) }));
            }}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="p-compare">
            Compare at price
          </label>
          <input
            id="p-compare"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control"
            value={values.compareAtPrice ? String(values.compareAtPrice) : ''}
            placeholder="0"
            onChange={(e) => {
              const digits = parseDigits(e.target.value);
              setValues((v) => ({
                ...v,
                compareAtPrice: digits === '' ? undefined : Number(digits),
              }));
            }}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="p-stock">
            Stock
          </label>
          <input
            id="p-stock"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control"
            required
            value={values.stock === 0 ? '' : String(values.stock)}
            placeholder="0"
            onChange={(e) => {
              const digits = parseDigits(e.target.value);
              setValues((v) => ({ ...v, stock: digits === '' ? 0 : Number(digits) }));
            }}
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
          <label className="form-label">Product images</label>
          <div className="sp-upload-box">
            <input
              id="p-images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              disabled={uploading || submitting}
              onChange={(e) => {
                void handleUpload(e.target.files);
                e.target.value = '';
              }}
            />
            <label htmlFor="p-images" className={`sp-upload-label ${uploading ? 'is-busy' : ''}`}>
              <FiUpload size={18} />
              <span>{uploading ? 'Uploading…' : 'Choose images to upload'}</span>
              <small>JPEG, PNG, WebP, GIF · max 5MB each · up to 8 files</small>
            </label>
          </div>

          {values.images.length > 0 && (
            <div className="sp-upload-grid mt-3">
              {values.images.map((img, idx) => (
                <div className="sp-upload-thumb" key={`${img}-${idx}`}>
                  <img src={img} alt={`Product ${idx + 1}`} />
                  <button
                    type="button"
                    className="sp-upload-remove"
                    aria-label="Remove image"
                    onClick={() =>
                      setValues((v) => ({ ...v, images: v.images.filter((_, i) => i !== idx) }))
                    }
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
      <button type="submit" className="btn btn-primary mt-4" disabled={submitting || uploading}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
