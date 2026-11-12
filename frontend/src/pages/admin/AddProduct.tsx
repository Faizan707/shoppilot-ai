import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProductForm, type ProductFormValues } from '../../components/ProductForm';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { queryKeys } from '../../hooks/queryKeys';
import { createProduct, fetchCategories } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

export function AddProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all(true),
    queryFn: () => fetchCategories(true),
  });

  const createMutation = useMutation({
    mutationFn: (values: ProductFormValues) => createProduct({ ...values }),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product created');
      navigate(`/admin/products/${product._id}/edit`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Create failed'));
    },
  });

  const loading = categoriesQuery.isPending;
  const categories = categoriesQuery.data ?? [];

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await createMutation.mutateAsync(values);
    } catch {
      throw new Error('Create failed');
    }
  };

  return (
    <div className="admin-page">
      <Link to="/admin/products" className="btn btn-link ps-0 mb-3">
        ← Back to products
      </Link>
      {loading ? (
        <LoadingSpinner label="Loading categories..." />
      ) : (
        <ProductForm categories={categories} submitLabel="Create product" onSubmit={handleSubmit} />
      )}
    </div>
  );
}
