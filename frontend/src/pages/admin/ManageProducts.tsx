import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../../lib/toast';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { Price } from '../../components/Price';
import { queryKeys } from '../../hooks/queryKeys';
import { deleteProduct, fetchProducts } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

export function ManageProducts() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const productParams = { page, limit: 12, all: true as const };

  const productsQuery = useQuery({
    queryKey: queryKeys.admin.products(productParams),
    queryFn: () => fetchProducts(productParams),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products(productParams) });
      toast.success('Product deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Delete failed'));
    },
  });

  const loading = productsQuery.isPending;
  const products = productsQuery.data?.items ?? [];
  const meta = productsQuery.data?.meta;

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="admin-page">
      <div className="d-flex justify-content-end align-items-center mb-4">
        <Link to="/admin/products/new" className="btn btn-admin-primary">
          Add product
        </Link>
      </div>
      {loading && <LoadingSpinner label="Loading products..." />}
      {!loading && products.length === 0 && <EmptyState title="No products" />}
      {!loading && products.length > 0 && (
        <div className="table-responsive card border-0 shadow-sm">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img src={product.images[0]} alt="" width={40} height={40} className="rounded" />
                      <div>
                        <div className="fw-semibold">{product.name}</div>
                        <div className="small text-muted">
                          {typeof product.category === 'object' ? product.category.name : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Price amount={product.price} size="sm" />
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`badge ${product.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link to={`/admin/products/${product._id}/edit`} className="btn btn-sm btn-outline-primary me-1">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => void handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {meta && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  );
}
