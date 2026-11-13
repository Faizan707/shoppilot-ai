import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { toast } from '../../lib/toast';
import { EmptyState } from '../../components/EmptyState';
import { ProductForm, type ProductFormValues } from '../../components/ProductForm';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { queryKeys } from '../../hooks/queryKeys';
import { fetchAdminProduct, fetchCategories, updateProduct } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

export function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: queryKeys.admin.product(id ?? ''),
    queryFn: () => fetchAdminProduct(id!),
    enabled: !!id,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all(true),
    queryFn: () => fetchCategories(true),
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) => updateProduct(id!, { ...values }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.admin.product(id!), updated);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id!) });
      toast.success('Product updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Update failed'));
    },
  });

  const loading = productQuery.isPending || categoriesQuery.isPending;
  const product = productQuery.data;
  const categories = categoriesQuery.data ?? [];
  const error = productQuery.isError ? 'Product not found' : '';

  const handleSubmit = async (values: ProductFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync(values);
    } catch {
      throw new Error('Update failed');
    }
  };

  if (loading) return <LoadingSpinner fullscreen label="Loading product..." />;
  if (error || !product) {
    return (
      <div className="admin-page">
        <EmptyState title="Product not found" description={error} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Link to="/admin/products" className="btn btn-link ps-0 mb-3">
        ← Back to products
      </Link>
      <ProductForm initial={product} categories={categories} submitLabel="Save changes" onSubmit={handleSubmit} />
    </div>
  );
}
